/**
 * @fileoverview View rendering and bindings for faculty grading workflows.
 * @module faculty/views/gradingView
 */

export function queryGradingElements() {
  const scopeSelect = document.querySelector(".js-faculty-scope-type");
  const schoolSelect = document.querySelector(".js-faculty-school-select");
  const departmentSelect = document.querySelector(".js-faculty-department-select");
  const programSelect = document.querySelector(".js-faculty-program-select");
  const courseSelect = document.querySelector(".js-faculty-course-select");
  const academicYearSelect = document.querySelector(".js-faculty-academic-year-select");
  const semesterSelect = document.querySelector(".js-faculty-semester-select");
  const marksInput = document.querySelector(".js-faculty-marks-input");
  const gradeForm = document.querySelector(".js-faculty-grade-form");
  const studentSearchInput = document.querySelector(".js-faculty-student-search-input");
  const studentSearchButton = document.querySelector(".js-faculty-student-search-btn");
  const studentResult = document.querySelector(".js-faculty-student-result");
  const message = document.querySelector("#faculty-grading-message");

  if (
    !(scopeSelect instanceof HTMLSelectElement) ||
    !(schoolSelect instanceof HTMLSelectElement) ||
    !(departmentSelect instanceof HTMLSelectElement) ||
    !(programSelect instanceof HTMLSelectElement) ||
    !(courseSelect instanceof HTMLSelectElement) ||
    !(academicYearSelect instanceof HTMLSelectElement) ||
    !(semesterSelect instanceof HTMLSelectElement) ||
    !(marksInput instanceof HTMLInputElement) ||
    !(gradeForm instanceof HTMLFormElement) ||
    !(studentSearchInput instanceof HTMLInputElement) ||
    !(studentSearchButton instanceof HTMLButtonElement) ||
    !(studentResult instanceof HTMLElement) ||
    !(message instanceof HTMLElement)
  ) {
    return null;
  }

  return {
    scopeSelect,
    schoolSelect,
    departmentSelect,
    programSelect,
    courseSelect,
    academicYearSelect,
    semesterSelect,
    marksInput,
    gradeForm,
    studentSearchInput,
    studentSearchButton,
    studentResult,
    message
  };
}

export function setGradingMessage(elements, text, type = "") {
  elements.message.textContent = text;
  elements.message.classList.remove("is-error", "is-success");
  if (type === "error") {
    elements.message.classList.add("is-error");
  }
  if (type === "success") {
    elements.message.classList.add("is-success");
  }
}

export function renderSelectOptions(select, items, getValue, getLabel, emptyLabel = "No options available") {
  const options = (Array.isArray(items) ? items : [])
    .map((item) => {
      const value = String(getValue(item) || "");
      const label = String(getLabel(item) || "");
      if (!value) {
        return "";
      }
      return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
    })
    .filter(Boolean)
    .join("");

  select.innerHTML = options || `<option value="">${escapeHtml(emptyLabel)}</option>`;
  if (!options) {
    select.value = "";
  }
}

export function setScopeControls(elements, scope) {
  elements.departmentSelect.disabled = scope !== "department";
  elements.programSelect.disabled = scope !== "program";

  if (scope !== "department") {
    elements.departmentSelect.value = "";
  }

  if (scope !== "program") {
    elements.programSelect.value = "";
  }
}

export function setStudentResult(elements, student, examInfo = null) {
  const name = student?.studentName || "None selected";
  const admissionNumber = student?.registrationNumber || "N/A";
  const program = student?.programName || "N/A";
  const hasCourse = Boolean(examInfo?.courseId);
  const selectedCourseText = String(examInfo?.courseLabel || "");
  const isUnavailable = Boolean(examInfo?.unavailable);
  const examRegistered = Boolean(examInfo?.examRegistered);
  const examStatusText = isUnavailable
    ? "Status unavailable"
    : !hasCourse
    ? "Select a course to view exam status."
    : examRegistered
      ? "Registered for exam"
      : "Not registered for exam";
  const examStatusClass = isUnavailable ? "" : !hasCourse ? "" : examRegistered ? "cleared" : "";

  elements.studentResult.innerHTML = `
    <div class="faculty-student-cards">
      <article class="student-summary-card">
        <h4>Student</h4>
        <p>${escapeHtml(name)}</p>
      </article>
      <article class="student-summary-card">
        <h4>Admission Number</h4>
        <p>${escapeHtml(admissionNumber)}</p>
      </article>
      <article class="student-summary-card">
        <h4>Program</h4>
        <p>${escapeHtml(program)}</p>
      </article>
      <article class="student-summary-card">
        <h4>Exam Status (Selected Course)</h4>
        <p>${escapeHtml(selectedCourseText || "No course selected")}</p>
        <span class="fee-status-badge ${escapeHtml(examStatusClass)}">${escapeHtml(examStatusText)}</span>
      </article>
    </div>
  `;
}

export function setGradeSubmitDisabled(elements, isDisabled) {
  const submitButton = elements.gradeForm.querySelector(".js-faculty-submit-grade-btn");
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = isDisabled;
  }
}

export function bindScopeChange(elements, handler) {
  elements.scopeSelect.addEventListener("change", handler);
}

export function bindSchoolChange(elements, handler) {
  elements.schoolSelect.addEventListener("change", handler);
}

export function bindDepartmentChange(elements, handler) {
  elements.departmentSelect.addEventListener("change", handler);
}

export function bindProgramChange(elements, handler) {
  elements.programSelect.addEventListener("change", handler);
}

export function bindCourseChange(elements, handler) {
  elements.courseSelect.addEventListener("change", handler);
}

export function bindAcademicYearChange(elements, handler) {
  elements.academicYearSelect.addEventListener("change", handler);
}

export function bindStudentSearch(elements, handler) {
  elements.studentSearchButton.addEventListener("click", handler);
  elements.studentSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handler();
    }
  });
}

export function bindGradeSubmit(elements, handler) {
  elements.gradeForm.addEventListener("submit", handler);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
