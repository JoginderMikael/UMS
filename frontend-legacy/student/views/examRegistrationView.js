/**
 * @fileoverview View rendering helpers for student exam registration workflows.
 * @module student/views/examRegistrationView
 */

/**
 * Renders exam registration summary on the dashboard home section.
 * @param {Array<object>} courses - Registered courses with exam status.
 * @param {object} options - Rendering options.
 * @param {boolean} options.feeCleared - Whether fee is cleared.
 */
export function renderExamRegistrationSummary(courses = [], { feeCleared = false } = {}) {
  const examsPanel = document.querySelector("#register-exams");
  if (!examsPanel) {
    return;
  }

  const rowsHtml = courses.map((course) => {
    const courseId = String(course.courseId || "");
    const courseCode = String(course.courseCode || "");
    const isExamRegistered = Boolean(course.examRegistered);
    const actionCell = isExamRegistered
      ? '<span class="fee-status-badge cleared">Registered</span>'
      : `<button type="button" class="row-action js-open-exam-registration-btn" data-course-id="${escapeHtml(
        courseId
      )}" data-course-code="${escapeHtml(courseCode)}" ${feeCleared ? "" : "disabled"}>Register Exam</button>`;

    return `
      <tr>
        <td>${escapeHtml(formatValue(courseCode))}</td>
        <td>${escapeHtml(formatValue(course.courseTitle))}</td>
        <td>${escapeHtml(formatValue(course.creditUnits))}</td>
        <td>${actionCell}</td>
      </tr>
    `;
  }).join("");

  examsPanel.innerHTML = `
    <h2>Registered Courses And Exam Registration</h2>
    <p class="form-message">${
      feeCleared
        ? "You can proceed with exam registration."
        : "Fee is not cleared. Exam registration is disabled until your fee is cleared."
    }</p>
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Credit Units</th>
            <th>Exam Registration</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="4">No registered courses found for the active semester.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Renders focused exam registration page.
 * @param {Array<object>} courses - Registered courses with exam status.
 * @param {object} options - Rendering options.
 * @param {boolean} options.feeCleared - Whether fee is cleared.
 */
export function renderExamRegistrationPage(courses = [], { feeCleared = false } = {}) {
  const pagePanel = document.querySelector("#exam-registration-page");
  if (!pagePanel) {
    return;
  }

  const rowsHtml = courses.map((course) => {
    const courseId = String(course.courseId || "");
    const courseCode = String(course.courseCode || "");
    const isExamRegistered = Boolean(course.examRegistered);
    const actionCell = isExamRegistered
      ? '<span class="fee-status-badge cleared">Registered</span>'
      : `<button type="button" class="row-action js-register-exam-page-btn" data-course-id="${escapeHtml(
        courseId
      )}" data-course-code="${escapeHtml(courseCode)}" ${feeCleared ? "" : "disabled"}>Register Exam</button>`;

    return `
      <tr>
        <td>${escapeHtml(formatValue(courseCode))}</td>
        <td>${escapeHtml(formatValue(course.courseTitle))}</td>
        <td>${escapeHtml(formatValue(course.creditUnits))}</td>
        <td>${actionCell}</td>
      </tr>
    `;
  }).join("");

  pagePanel.innerHTML = `
    <h2>Exam Registration</h2>
    <div class="course-registration-actions">
      <button type="button" class="ghost js-exit-exam-registration-view">Back To Dashboard</button>
    </div>
    <p class="form-message js-exam-registration-message">${
      feeCleared
        ? "Select a course and register for exams."
        : "Fee is not cleared. Exam registration buttons are disabled."
    }</p>
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Credit Units</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="4">No registered courses found for the active semester.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Binds exam registration actions in home summary and focused page.
 * @param {object} callbacks - Event callbacks.
 * @param {Function} callbacks.onOpenRegistrationPage - Invoked with (courseId).
 * @param {Function} callbacks.onRegisterExam - Invoked with (courseId, courseCode).
 */
export function bindExamRegistrationActions({
  onOpenRegistrationPage,
  onRegisterExam
}) {
  const openButtons = document.querySelectorAll(".js-open-exam-registration-btn");
  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const courseId = button.getAttribute("data-course-id") || "";
      onOpenRegistrationPage(courseId);
    });
  });

  const registerButtons = document.querySelectorAll(".js-register-exam-page-btn");
  registerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const courseId = button.getAttribute("data-course-id") || "";
      const courseCode = button.getAttribute("data-course-code") || "";
      onRegisterExam(courseId, courseCode);
    });
  });
}

/**
 * Updates exam registration page status text.
 * @param {string} message - Status text.
 * @param {string} [type] - Optional contextual class ('success' | 'error').
 */
export function setExamRegistrationMessage(message, type = "") {
  const messageElement = document.querySelector(".js-exam-registration-message");
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
