/**
 * @fileoverview Controller for student transcript/result workflows.
 * @module student/controllers/transcriptController
 */
import { fetchStudentTranscript } from "../models/transcriptModel.js";
import {
  bindTranscriptActions,
  renderTranscriptPage,
  renderTranscriptSummary,
  setTranscriptMessage
} from "../views/transcriptView.js";

/**
 * Initializes transcript summary and detailed page.
 * @param {object} params - Initialization arguments.
 * @param {string} params.token - Authorization token.
 * @param {string} params.studentId - Student identifier.
 * @param {object} params.student - Student profile.
 * @param {Function} params.onStatusMessage - Dashboard-level status callback.
 * @returns {Promise<object>} Controller actions.
 */
export async function initTranscriptController({
  token,
  studentId,
  student,
  onStatusMessage
}) {
  const state = {
    token: String(token || ""),
    studentId: String(studentId || ""),
    student: student && typeof student === "object" ? student : {},
    transcript: null,
    selectedAcademicYear: ""
  };

  const renderCurrentTranscriptPage = () => {
    renderTranscriptPage(state.transcript, {
      selectedAcademicYear: state.selectedAcademicYear
    });
    bindTranscriptActions({
      onGeneratePdf: () => {
        const transcriptForSelectedYear = filterTranscriptByAcademicYear(state.transcript, state.selectedAcademicYear);
        generateTranscriptPdf(transcriptForSelectedYear, state.student);
      },
      onAcademicYearChange: (academicYear) => {
        state.selectedAcademicYear = String(academicYear || "");
        renderCurrentTranscriptPage();
        setTranscriptMessage(`Showing results for ${state.selectedAcademicYear || "selected academic year"}.`, "success");
      }
    });
  };

  const loadTranscript = async () => {
    if (!state.token || !state.studentId) {
      renderTranscriptSummary({
        academicYear: "N/A",
        semesterCount: 0,
        totalCourses: 0,
        averageMarksText: "N/A",
        gradeSnapshot: "N/A"
      });
      renderTranscriptPage(null, { selectedAcademicYear: "" });
      return;
    }

    try {
      state.transcript = await fetchStudentTranscript(state.studentId, state.token);
      state.selectedAcademicYear = getDefaultAcademicYear(state.transcript);
      const summary = buildTranscriptSummary(state.transcript);
      renderTranscriptSummary(summary);
      renderCurrentTranscriptPage();
      setTranscriptMessage("Transcript details loaded.", "success");
    } catch (error) {
      const message = error.message || "Failed to load transcript.";
      renderTranscriptSummary({
        academicYear: "N/A",
        semesterCount: 0,
        totalCourses: 0,
        averageMarksText: "N/A",
        gradeSnapshot: "N/A"
      });
      renderTranscriptPage(null, { selectedAcademicYear: "" });
      setTranscriptMessage(message, "error");
      if (onStatusMessage) {
        onStatusMessage(message, "error");
      }
    }
  };

  await loadTranscript();

  return {
    async refresh() {
      await loadTranscript();
    }
  };
}

function getDefaultAcademicYear(transcript) {
  const years = extractAcademicYears(transcript);
  if (years.length === 0) {
    return "";
  }
  const sorted = [...years].sort(compareAcademicYearDescending);
  return sorted[0];
}

function filterTranscriptByAcademicYear(transcript, academicYear) {
  const targetYear = String(academicYear || "").trim();
  if (!targetYear) {
    return transcript;
  }

  const records = Array.isArray(transcript)
    ? transcript
    : transcript && typeof transcript === "object"
      ? [transcript]
      : [];

  const filtered = records.filter((record) => String(record?.academicYear || "").trim() === targetYear);
  return filtered;
}

function extractAcademicYears(transcript) {
  const records = Array.isArray(transcript)
    ? transcript
    : transcript && typeof transcript === "object"
      ? [transcript]
      : [];

  return [...new Set(
    records
      .map((record) => String(record?.academicYear || "").trim())
      .filter(Boolean)
  )];
}

function compareAcademicYearDescending(left, right) {
  return parseAcademicYearSortValue(right) - parseAcademicYearSortValue(left);
}

function parseAcademicYearSortValue(value) {
  const text = String(value || "").trim();
  const matched = text.match(/^(\d{4})(?:\D+(\d{4}))?/);
  if (!matched) {
    return 0;
  }

  const startYear = Number(matched[1] || 0);
  const endYear = Number(matched[2] || startYear);
  return (startYear * 10000) + endYear;
}

function buildTranscriptSummary(transcript) {
  const normalized = normalizeTranscript(transcript);
  const grades = {};
  let totalCourses = 0;
  let marksTotal = 0;
  let marksCount = 0;

  normalized.semesters.forEach((semester) => {
    semester.courses.forEach((course) => {
      totalCourses += 1;
      const grade = String(course.grade || "").trim();
      if (grade) {
        grades[grade] = (grades[grade] || 0) + 1;
      }

      const numericMarks = Number(course.marks);
      if (Number.isFinite(numericMarks)) {
        marksTotal += numericMarks;
        marksCount += 1;
      }
    });
  });

  const averageMarks = marksCount > 0 ? (marksTotal / marksCount).toFixed(2) : null;
  const gradeSnapshot = Object.entries(grades)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([grade, count]) => `${grade}:${count}`)
    .join(" | ");

  return {
    academicYear: normalized.academicYear || "N/A",
    semesterCount: normalized.semesters.length,
    totalCourses,
    averageMarksText: averageMarks ? `${averageMarks}%` : "N/A",
    gradeSnapshot: gradeSnapshot || "N/A"
  };
}

function normalizeTranscript(transcript) {
  const records = Array.isArray(transcript)
    ? transcript
    : transcript && typeof transcript === "object"
      ? [transcript]
      : [];

  const semesters = records.flatMap((record) => {
    const yearLabel = String(record?.academicYear || "");
    const yearSemesters = Array.isArray(record?.semesters) ? record.semesters : [];
    return yearSemesters.map((semester) => ({
      academicYear: yearLabel,
      semesterNumber: semester?.semesterNumber ?? "",
      courses: Array.isArray(semester?.courses)
        ? semester.courses.map((course) => ({
          courseCode: String(course?.courseCode || ""),
          courseName: String(course?.courseName || course?.courseTitle || ""),
          marks: course?.marks ?? "",
          grade: String(course?.grade || "")
        }))
        : []
    }));
  });

  const academicYears = [...new Set(
    records
      .map((record) => String(record?.academicYear || "").trim())
      .filter(Boolean)
  )];

  let academicYear = "";
  if (academicYears.length === 1) {
    academicYear = academicYears[0];
  } else if (academicYears.length > 1) {
    academicYear = `Multiple Years (${academicYears.length})`;
  }

  return {
    academicYear,
    semesters
  };
}

function generateTranscriptPdf(transcript, student) {
  const normalized = normalizeTranscript(transcript);
  const studentName = resolveStudentName(student);
  const registrationNumber = resolveRegistrationNumber(student);
  const pdfColumns = {
    codeWidth: 16,
    titleWidth: 38,
    marksWidth: 6,
    gradeWidth: 5
  };

  const lines = [
    "AURA HEIGHTS UNIVERSITY",
    "Official Academic Transcript",
    "",
    `Student Name: ${studentName}`,
    `Registration Number: ${registrationNumber}`,
    `Academic Year: ${normalized.academicYear || "N/A"}`,
    ""
  ];

  normalized.semesters.forEach((semester) => {
    lines.push(`Semester ${semester.semesterNumber || "N/A"}`);
    lines.push(formatTranscriptHeaderRow(pdfColumns));
    lines.push("-".repeat(formatTranscriptHeaderRow(pdfColumns).length));
    semester.courses.forEach((course) => {
      lines.push(formatTranscriptCourseRow(course, pdfColumns));
    });
    lines.push("");
  });

  const pdfBlob = createPdfFromLines(lines);
  const fileName = `transcript-${sanitizeFileName(registrationNumber || studentName || "student")}.pdf`;
  downloadBlob(pdfBlob, fileName);
}

function resolveStudentName(student) {
  const data = student && typeof student === "object" ? student : {};
  return String(data.fullName || data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "N/A");
}

function resolveRegistrationNumber(student) {
  const data = student && typeof student === "object" ? student : {};
  return String(data.registrationNumber || data.regNo || data.admissionNumber || "N/A");
}

function padRight(value, length) {
  const text = String(value || "");
  if (text.length >= length) {
    return text.slice(0, length);
  }
  return text + " ".repeat(length - text.length);
}

function padLeft(value, length) {
  const text = String(value || "");
  if (text.length >= length) {
    return text.slice(text.length - length);
  }
  return " ".repeat(length - text.length) + text;
}

function formatTranscriptHeaderRow(columns) {
  const code = padRight("Course Code", columns.codeWidth);
  const title = padRight("Course Title", columns.titleWidth);
  const marks = padLeft("Marks", columns.marksWidth);
  const grade = padRight("Grade", columns.gradeWidth);
  return `${code}  ${title}  ${marks}  ${grade}`;
}

function formatTranscriptCourseRow(course, columns) {
  const code = padRight(course?.courseCode || "", columns.codeWidth);
  const title = padRight(trimToWidth(course?.courseName || "", columns.titleWidth), columns.titleWidth);
  const marks = padLeft(formatMarks(course?.marks), columns.marksWidth);
  const grade = padRight(trimToWidth(String(course?.grade || "N/A"), columns.gradeWidth), columns.gradeWidth);
  return `${code}  ${title}  ${marks}  ${grade}`;
}

function formatMarks(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return String(value);
}

function trimToWidth(value, width) {
  const text = String(value || "");
  if (text.length <= width) {
    return text;
  }
  if (width <= 1) {
    return text.slice(0, width);
  }
  return `${text.slice(0, width - 1)}~`;
}

function sanitizeFileName(value) {
  return String(value || "transcript")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function createPdfFromLines(lines) {
  const maxLinesPerPage = 46;
  const pages = [];
  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage));
  }
  if (pages.length === 0) {
    pages.push(["Transcript not available."]);
  }

  const objects = [];
  let nextObjectId = 1;

  const catalogId = nextObjectId++;
  const pagesId = nextObjectId++;
  const fontId = nextObjectId++;
  const pageIds = pages.map(() => nextObjectId++);
  const contentIds = pages.map(() => nextObjectId++);

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

  pages.forEach((pageLines, pageIndex) => {
    const pageId = pageIds[pageIndex];
    const contentId = contentIds[pageIndex];
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;

    const streamLines = pageLines.map((line) => `(${escapePdfText(line)}) Tj`);
    const stream = `BT
/F1 10 Tf
50 800 Td
13 TL
${streamLines.join("\nT*\n")}
ET`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    offsets[objectId] = pdf.length;
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function escapePdfText(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}
