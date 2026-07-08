/**
 * @fileoverview View rendering helpers for student transcript/result workflows.
 * @module student/views/transcriptView
 */

/**
 * Renders highly summarized transcript details on dashboard home.
 * @param {object} summary - Summary stats.
 */
export function renderTranscriptSummary(summary) {
  const panel = document.querySelector("#results-transcripts");
  if (!panel) {
    return;
  }

  const data = summary && typeof summary === "object" ? summary : {};
  panel.innerHTML = `
    <h2>Results And Transcripts</h2>
    <p class="form-message">Summary of your transcript records.</p>
    <div class="fee-status-container">
      <div class="fee-status-cards">
        <article class="fee-status-card">
          <p class="fee-status-label">Academic Year</p>
          <strong>${escapeHtml(formatValue(data.academicYear))}</strong>
        </article>
        <article class="fee-status-card">
          <p class="fee-status-label">Semesters</p>
          <strong>${escapeHtml(formatValue(data.semesterCount))}</strong>
        </article>
        <article class="fee-status-card">
          <p class="fee-status-label">Completed Courses</p>
          <strong>${escapeHtml(formatValue(data.totalCourses))}</strong>
        </article>
        <article class="fee-status-card">
          <p class="fee-status-label">Average Marks</p>
          <strong>${escapeHtml(formatValue(data.averageMarksText))}</strong>
        </article>
        <article class="fee-status-card">
          <p class="fee-status-label">Grades</p>
          <strong>${escapeHtml(formatValue(data.gradeSnapshot))}</strong>
        </article>
      </div>
    </div>
  `;
}

/**
 * Renders the detailed results/transcript page.
 * @param {object|null} transcript - Transcript payload.
 * @param {object} [options] - Rendering options.
 * @param {string} [options.selectedAcademicYear] - Selected academic year.
 */
export function renderTranscriptPage(transcript, options = {}) {
  const panel = document.querySelector("#results-transcripts-page");
  if (!panel) {
    return;
  }

  const selectedAcademicYear = String(options?.selectedAcademicYear || "");
  const normalized = normalizeTranscript(transcript, selectedAcademicYear);
  const yearOptions = normalized.academicYears.map((year) => `
    <option value="${escapeHtml(year)}" ${year === normalized.selectedAcademicYear ? "selected" : ""}>
      ${escapeHtml(year)}
    </option>
  `).join("");
  const semesterBlocks = normalized.semesters.map((semester) => {
    const rowsHtml = semester.courses.map((course) => `
      <tr>
        <td>${escapeHtml(formatValue(course.courseCode))}</td>
        <td>${escapeHtml(formatValue(course.courseName))}</td>
        <td>${escapeHtml(formatValue(course.marks))}</td>
        <td>${escapeHtml(formatValue(course.grade))}</td>
      </tr>
    `).join("");

    return `
      <section class="stack transcript-semester-section">
        <h3>${escapeHtml(
          `${semester.academicYear ? `${semester.academicYear} - ` : ""}Semester ${formatValue(semester.semesterNumber)}`
        )}</h3>
        <div class="users-table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Marks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="4">No course results found for this semester.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }).join("");

  panel.innerHTML = `
    <h2>Results And Transcript</h2>
    <div class="course-registration-actions">
      <button type="button" class="ghost js-exit-transcript-view">Back To Dashboard</button>
      <button type="button" class="js-generate-transcript-pdf-btn">Generate PDF</button>
    </div>
    <div class="transcript-year-filter">
      <label for="transcript-academic-year">Academic Year</label>
      <select id="transcript-academic-year" class="js-transcript-academic-year-select" ${yearOptions ? "" : "disabled"}>
        ${yearOptions || '<option value="">No academic years available</option>'}
      </select>
    </div>
    <p class="form-message js-transcript-message">Transcript details loaded.</p>
    <div class="fee-status-container">
      <div class="fee-status-cards">
        <article class="fee-status-card">
          <p class="fee-status-label">Academic Year</p>
          <strong>${escapeHtml(formatValue(normalized.academicYear))}</strong>
        </article>
        <article class="fee-status-card">
          <p class="fee-status-label">Semesters</p>
          <strong>${escapeHtml(formatValue(normalized.semesters.length))}</strong>
        </article>
        <article class="fee-status-card">
          <p class="fee-status-label">Total Courses</p>
          <strong>${escapeHtml(formatValue(countCourses(normalized.semesters)))}</strong>
        </article>
      </div>
    </div>
    <div class="stack transcript-semesters-wrap">
      ${semesterBlocks || '<p class="form-message">No transcript records available yet.</p>'}
    </div>
  `;
}

/**
 * Binds transcript actions.
 * @param {object} callbacks - Event callbacks.
 * @param {Function} callbacks.onGeneratePdf - Generate PDF callback.
 * @param {Function} callbacks.onAcademicYearChange - Academic year change callback.
 */
export function bindTranscriptActions({ onGeneratePdf, onAcademicYearChange }) {
  const generatePdfButton = document.querySelector(".js-generate-transcript-pdf-btn");
  if (generatePdfButton instanceof HTMLButtonElement) {
    generatePdfButton.addEventListener("click", () => {
      onGeneratePdf();
    });
  }

  const yearSelect = document.querySelector(".js-transcript-academic-year-select");
  if (yearSelect instanceof HTMLSelectElement && typeof onAcademicYearChange === "function") {
    yearSelect.addEventListener("change", () => {
      onAcademicYearChange(yearSelect.value);
    });
  }
}

/**
 * Updates transcript page status message.
 * @param {string} message - Message text.
 * @param {string} [type] - Optional contextual class ('success' | 'error').
 */
export function setTranscriptMessage(message, type = "") {
  const messageElement = document.querySelector(".js-transcript-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-error", "is-success");
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
}

function normalizeTranscript(transcript, selectedAcademicYear = "") {
  const records = Array.isArray(transcript)
    ? transcript
    : transcript && typeof transcript === "object"
      ? [transcript]
      : [];

  const academicYears = [...new Set(
    records
      .map((record) => String(record?.academicYear || "").trim())
      .filter(Boolean)
  )].sort(compareAcademicYearDescending);

  const resolvedSelectedAcademicYear = academicYears.includes(selectedAcademicYear)
    ? selectedAcademicYear
    : academicYears[0] || "";

  const filteredRecords = resolvedSelectedAcademicYear
    ? records.filter((record) => String(record?.academicYear || "").trim() === resolvedSelectedAcademicYear)
    : records;

  const semesters = filteredRecords.flatMap((record) => {
    const yearLabel = String(record?.academicYear || "");
    const yearSemesters = Array.isArray(record?.semesters) ? record.semesters : [];
    return yearSemesters.map((semester) => ({
      academicYear: yearLabel,
      semesterNumber: semester?.semesterNumber ?? "",
      courses: Array.isArray(semester?.courses)
        ? semester.courses.map((course) => ({
          courseId: String(course?.courseId || ""),
          courseCode: String(course?.courseCode || ""),
          courseName: String(course?.courseName || course?.courseTitle || ""),
          marks: course?.marks ?? "",
          grade: String(course?.grade || "")
        }))
        : []
    }));
  });

  return {
    academicYear: resolvedSelectedAcademicYear || "",
    academicYears,
    selectedAcademicYear: resolvedSelectedAcademicYear,
    semesters
  };
}

function countCourses(semesters) {
  return semesters.reduce((sum, semester) => sum + semester.courses.length, 0);
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return String(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
