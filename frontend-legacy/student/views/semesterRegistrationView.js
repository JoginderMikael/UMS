/**
 * @fileoverview View rendering helpers for student semester registration workflows.
 * @module student/views/semesterRegistrationView
 */

/**
 * Renders semester registration panel.
 * @param {object} details - Current active semester details.
 * @param {string} details.activeSemesterName - Active semester name.
 * @param {string} details.activeAcademicYearName - Active academic year name.
 * @param {string} details.studentId - Student unique identifier.
 */
export function renderSemesterRegistrationPanel({
  activeSemesterName = "N/A",
  activeAcademicYearName = "N/A",
  studentId = ""
} = {}) {
  const panel = document.querySelector("#register-semester");
  if (!panel) {
    return;
  }

  panel.innerHTML = `
    <div class="semester-registration-panel">
      <h2>Semester Registration</h2>
      <p class="form-message">Enroll in the active semester before registering courses.</p>
      <div class="semester-detail-grid">
        <article class="semester-detail-box">
          <p class="semester-detail-label">Current Semester</p>
          <strong>${escapeHtml(formatValue(activeSemesterName))}</strong>
        </article>
        <article class="semester-detail-box">
          <p class="semester-detail-label">Academic Year</p>
          <strong>${escapeHtml(formatValue(activeAcademicYearName))}</strong>
        </article>
        <article class="semester-detail-box">
          <p class="semester-detail-label">Student ID</p>
          <strong>${escapeHtml(formatValue(studentId))}</strong>
        </article>
      </div>
      <div class="course-registration-actions semester-registration-actions">
        <button type="button" class="ghost js-exit-semester-registration-view">Back To Dashboard</button>
        <button type="button" class="js-register-semester-btn">Register Semester</button>
      </div>
      <p class="form-message js-semester-registration-message" role="status" aria-live="polite"></p>
    </div>
  `;
}

/**
 * Binds semester registration panel actions.
 * @param {object} callbacks - Event callbacks.
 * @param {Function} callbacks.onRegisterSemester - Triggered when register button is clicked.
 */
export function bindSemesterRegistrationActions({ onRegisterSemester }) {
  const registerButton = document.querySelector(".js-register-semester-btn");
  if (registerButton instanceof HTMLButtonElement) {
    registerButton.addEventListener("click", () => onRegisterSemester());
  }
}

/**
 * Updates semester registration panel feedback.
 * @param {string} message - Feedback text.
 * @param {string} [type] - 'success' or 'error'.
 */
export function setSemesterRegistrationMessage(message, type = "") {
  const messageElement = document.querySelector(".js-semester-registration-message");
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

