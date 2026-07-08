/**
 * @fileoverview View rendering helpers for student course registration workflows.
 * @module student/views/courseRegistrationView
 */

/**
 * Renders registration catalog for affiliated and school-wide courses.
 * @param {object} data - Registration panel input.
 * @param {Array<object>} data.affiliatedCourses - Program-affiliated courses.
 * @param {Array<object>} data.otherCourses - Additional searchable courses.
 * @param {Set<string>} data.selectedCourseIds - Currently selected course IDs for bulk registration.
 * @param {Set<string>} data.registeredCourseIds - Already registered course IDs.
 * @param {boolean} data.showOtherCourses - Visibility flag for the other-courses section.
 * @param {string} data.otherSearchQuery - Search query for other courses.
 */
export function renderCourseRegistrationCatalog({
  affiliatedCourses = [],
  otherCourses = [],
  selectedCourseIds = new Set(),
  registeredCourseIds = new Set(),
  showOtherCourses = false,
  otherSearchQuery = ""
} = {}) {
  const coursesPanel = document.querySelector("#register-courses");
  if (!coursesPanel) {
    return;
  }

  const affiliatedRows = affiliatedCourses.map((course) => {
    const courseId = String(course.courseId || course.id || "");
    const isRegistered = registeredCourseIds.has(courseId);
    const isSelected = selectedCourseIds.has(courseId);
    const actionCell = isRegistered
      ? '<span class="fee-status-badge cleared">Already Registered</span>'
      : `<button type="button" class="row-action js-register-course-btn" data-course-id="${escapeHtml(
        courseId
      )}" data-course-code="${escapeHtml(String(course.courseCode || course.code || ""))}" ${courseId ? "" : "disabled"}>Register</button>`;

    return `
      <tr>
        <td>
          <input
            type="checkbox"
            class="js-course-select"
            data-course-id="${escapeHtml(courseId)}"
            ${isSelected ? "checked" : ""}
            ${isRegistered || !courseId ? "disabled" : ""}
            aria-label="Select course ${escapeHtml(String(course.courseCode || course.code || course.courseTitle || course.title || ""))}"
          >
        </td>
        <td>${escapeHtml(formatValue(course.courseCode || course.code))}</td>
        <td>${escapeHtml(formatValue(course.courseTitle || course.title))}</td>
        <td>${escapeHtml(formatValue(course.creditUnits))}</td>
        <td>${escapeHtml(formatValue(course.courseType || "N/A"))}</td>
        <td>${escapeHtml(formatValue(course.yearOfStudy || "N/A"))}</td>
        <td>${actionCell}</td>
      </tr>
    `;
  }).join("");

  const otherRows = otherCourses.map((course) => {
    const courseId = String(course.courseId || course.id || "");
    const isRegistered = registeredCourseIds.has(courseId);
    const isSelected = selectedCourseIds.has(courseId);
    const actionCell = isRegistered
      ? '<span class="fee-status-badge cleared">Already Registered</span>'
      : `<button type="button" class="row-action js-register-course-btn" data-course-id="${escapeHtml(
        courseId
      )}" data-course-code="${escapeHtml(String(course.courseCode || course.code || ""))}">Register</button>`;

    return `
      <tr>
        <td>
          <input
            type="checkbox"
            class="js-course-select"
            data-course-id="${escapeHtml(courseId)}"
            ${isSelected ? "checked" : ""}
            ${isRegistered ? "disabled" : ""}
            aria-label="Select course ${escapeHtml(String(course.courseCode || course.code || course.courseTitle || course.title || ""))}"
          >
        </td>
        <td>${escapeHtml(formatValue(course.courseCode || course.code))}</td>
        <td>${escapeHtml(formatValue(course.courseTitle || course.title))}</td>
        <td>${escapeHtml(formatValue(course.creditUnits))}</td>
        <td>${escapeHtml(formatValue(course.departmentName || course.departmentCode))}</td>
        <td>${actionCell}</td>
      </tr>
    `;
  }).join("");

  coursesPanel.innerHTML = `
    <h2>Course Registration</h2>
    <div class="course-registration-actions">
      <button type="button" class="ghost js-exit-course-registration-view">Back To Dashboard</button>
      <button type="button" class="js-register-selected-btn">Register Selected (${selectedCourseIds.size})</button>
      <button type="button" class="ghost js-toggle-other-courses-btn">${showOtherCourses ? "Hide" : "Find"} Other Courses</button>
    </div>

    <section class="stack" aria-label="Program affiliated courses">
      <h3>Program Affiliated Courses</h3>
      <p class="form-message">These are listed first to simplify registration and filtered to your current year of study.</p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Credit Units</th>
              <th>Course Type</th>
              <th>Year Of Study</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${affiliatedRows || '<tr><td colspan="7">No affiliated courses were found for your program.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>

    <section class="stack ${showOtherCourses ? "" : "is-hidden"}" aria-label="Other school courses">
      <h3>Other Courses</h3>
      <div class="users-search course-catalog-search">
        <input
          type="text"
          class="js-other-courses-search-input"
          placeholder="Search by title or code"
          value="${escapeHtml(otherSearchQuery)}"
        >
        <button type="button" class="js-other-courses-search-btn">Search</button>
      </div>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Credit Units</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${otherRows || '<tr><td colspan="6">No courses matched your search.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/**
 * Binds interactions for the course registration catalog.
 * @param {object} callbacks - View event callbacks.
 * @param {Function} callbacks.onRegisterSingle - Invoked with (courseId, courseCode).
 * @param {Function} callbacks.onRegisterSelected - Invoked when bulk register button is clicked.
 * @param {Function} callbacks.onToggleOtherCourses - Invoked when toggle button is clicked.
 * @param {Function} callbacks.onSearchOtherCourses - Invoked with search query.
 * @param {Function} callbacks.onSelectCourse - Invoked with (courseId, isSelected).
 */
export function bindCourseRegistrationActions({
  onRegisterSingle,
  onRegisterSelected,
  onToggleOtherCourses,
  onSearchOtherCourses,
  onSelectCourse
}) {
  const registerSelectedButton = document.querySelector(".js-register-selected-btn");
  if (registerSelectedButton instanceof HTMLButtonElement) {
    registerSelectedButton.addEventListener("click", () => onRegisterSelected());
  }

  const toggleOtherButton = document.querySelector(".js-toggle-other-courses-btn");
  if (toggleOtherButton instanceof HTMLButtonElement) {
    toggleOtherButton.addEventListener("click", () => onToggleOtherCourses());
  }

  const searchInput = document.querySelector(".js-other-courses-search-input");
  const searchButton = document.querySelector(".js-other-courses-search-btn");
  if (searchInput instanceof HTMLInputElement && searchButton instanceof HTMLButtonElement) {
    const submitSearch = () => onSearchOtherCourses(searchInput.value.trim());
    searchButton.addEventListener("click", submitSearch);
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitSearch();
      }
    });
  }

  const selectCheckboxes = document.querySelectorAll(".js-course-select");
  selectCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (!(checkbox instanceof HTMLInputElement)) {
        return;
      }
      const courseId = checkbox.getAttribute("data-course-id") || "";
      onSelectCourse(courseId, checkbox.checked);
    });
  });

  const registerButtons = document.querySelectorAll(".js-register-course-btn");
  registerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const courseId = button.getAttribute("data-course-id") || "";
      const courseCode = button.getAttribute("data-course-code") || "";
      onRegisterSingle(courseId, courseCode);
    });
  });
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
