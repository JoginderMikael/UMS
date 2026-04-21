/**
 * @fileoverview Presentation Layer for Academic Programs.
 * Manages the UI lifecycle for program definitions, organizational nesting
 * (School/Department), curriculum mapping (Courses), and profile management.
 * @module admin/views/programView
 */
const PROGRAM_DETAIL_FIELDS = [
  { label: "Program ID", key: "id" },
  { label: "Program Name", key: "name" },
  { label: "Program Code", key: "code" },
  { label: "School ID", key: "schoolId" },
  { label: "School Name", key: "schoolName" },
  { label: "School Code", key: "schoolCode" },
  { label: "Department ID", key: "departmentId" },
  { label: "Department Name", key: "departmentName" },
  { label: "Department Code", key: "departmentCode" }
];

/**
 * Binds triggers (sidebar or dashboard links) that launch the Program Creation workflow.
 * @param {Function} onCreateProgramRequest - Initialization callback.
 */
export function bindCreateProgramTriggers(onCreateProgramRequest) {
  const createProgramLinks = document.querySelectorAll(".js-create-program");
  createProgramLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onCreateProgramRequest();
    });
  });
}

/**
 * Binds triggers that load the exhaustive academic programs catalog.
 * @param {Function} onViewAllProgramsRequest - Navigation callback.
 */
export function bindViewAllProgramsTrigger(onViewAllProgramsRequest) {
  const viewAllProgramsLink = document.querySelector(".js-view-all-programs");
  if (!viewAllProgramsLink) {
    return;
  }

  viewAllProgramsLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewAllProgramsRequest();
  });
}

/**
 * Binds triggers that navigate to the program search and details profile.
 * @param {Function} onProgramDetailsTabRequest - Navigation callback.
 */
export function bindProgramDetailsTabTrigger(onProgramDetailsTabRequest) {
  const programDetailsLinks = document.querySelectorAll(".js-view-program-details");
  if (programDetailsLinks.length === 0) {
    return;
  }

  programDetailsLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onProgramDetailsTabRequest();
    });
  });
}

/**
 * Renders the program registration form in the main content area.
 * @param {object} options - Initial dropdown states for school and department nesting.
 * @param {Array<object>} options.schools - Available parent schools.
 * @param {Array<object>} options.departments - Departments within the selected school.
 * @param {string} options.selectedSchoolId - Currently selected school.
 * @param {string} options.selectedDepartmentId - Currently selected department.
 */
export function renderCreateProgramForm({
  schools = [],
  departments = [],
  selectedSchoolId = "",
  selectedDepartmentId = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel create-user-panel">
      <h2><i class="fas fa-graduation-cap"></i> Create Program</h2>
      <form class="create-user-form" id="create-program-form">
        <label for="program-school-id">
          <i class="fas fa-building"></i> School
          <select id="program-school-id" name="schoolId" class="js-program-school-select" required>
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="program-department-id">
          <i class="fas fa-sitemap"></i> Department
          <select id="program-department-id" name="departmentId" class="js-program-department-select" required>
            ${renderDepartmentOptions(departments, selectedDepartmentId)}
          </select>
        </label>
        <label for="program-name">
          <i class="fas fa-heading"></i> Program Name
          <input type="text" id="program-name" name="name" required>
        </label>
        <label for="program-code">
          <i class="fas fa-barcode"></i> Program Code
          <input type="text" id="program-code" name="code" required>
        </label>
        <button type="submit"><i class="fas fa-plus-circle"></i> Create Program</button>
        <p class="form-message" id="create-program-message" role="status" aria-live="polite"></p>
      </form>
      <div class="created-user-result" id="created-program-result" hidden></div>
    </section>`;
}

/**
 * Binds the submission event for the program registration form.
 * @param {Function} onSubmit - Callback receiving the program data payload.
 */
export function bindCreateProgramSubmit(onSubmit) {
  const form = document.querySelector("#create-program-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    onSubmit({
      name: (formData.get("name") || "").toString().trim(),
      code: (formData.get("code") || "").toString().trim(),
      schoolId: (formData.get("schoolId") || "").toString().trim(),
      departmentId: (formData.get("departmentId") || "").toString().trim()
    });
  });
}

/**
 * Binds the school selection change in the creation form to fetch departments.
 * @param {Function} onSchoolChange - Callback receiving the selected School ID.
 */
export function bindProgramSchoolChange(onSchoolChange) {
  const schoolSelect = document.querySelector(".js-program-school-select");
  if (!(schoolSelect instanceof HTMLSelectElement)) {
    return;
  }

  schoolSelect.addEventListener("change", () => {
    onSchoolChange(schoolSelect.value);
  });
}

/**
 * Sets set program department options.
 * @param {Array<*>} departments
 * @param {string|number} selectedDepartmentId
 * @returns {void}
 */
export function setProgramDepartmentOptions(departments, selectedDepartmentId = "") {
  const departmentSelect = document.querySelector(".js-program-department-select");
  if (!(departmentSelect instanceof HTMLSelectElement)) {
    return;
  }

  departmentSelect.innerHTML = renderDepartmentOptions(departments, selectedDepartmentId);
}

/**
 * Updates the feedback message for the program creation form.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setCreateProgramMessage(message, type = "") {
  const messageElement = document.querySelector("#create-program-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Sets the loading state for the program creation submit button.
 * @param {boolean} isSubmitting - Whether the request is in flight.
 */
export function setCreateProgramSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#create-program-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Creating..." : "Create Program";
}

/**
 * Renders the confirmation view for a newly created program.
 * @param {object|null} program - The created program object or null.
 */
export function renderCreatedProgramDetails(program) {
  const resultContainer = document.querySelector("#created-program-result");
  if (!resultContainer) {
    return;
  }

  if (!program || typeof program !== "object") {
    resultContainer.hidden = true;
    resultContainer.innerHTML = "";
    return;
  }

  resultContainer.innerHTML = renderDetailsHtml(program, "Created Program Details");
  resultContainer.hidden = false;
}

/**
 * Renders the interactive catalog of academic programs.
 * @param {Array<object>} programs - List of programs to display.
 */
export function renderProgramsScreen(programs) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = programs
    .map(
      (program) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(program.name))}</td>
          <td>${escapeHtml(formatFieldValue(program.schoolName || program.schoolCode || program.schoolId))}</td>
          <td>${escapeHtml(
        formatFieldValue(program.departmentName || program.departmentCode || program.departmentId)
      )}</td>
          <td>
            <button type="button" class="row-action js-select-program" data-program-id="${escapeHtml(
        formatIdentifier(program.id)
      )}" ${formatIdentifier(program.id) ? "" : "disabled"}>Select</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-list"></i> All Programs</h2>
      <p class="form-message" id="programs-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>School</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-programs-table-body">
            ${rows || '<tr><td colspan="4">No programs found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Binds the selection of a program from the catalog table.
 * @param {Function} onProgramSelect - Callback receiving the selected Program ID.
 */
export function bindProgramSelect(onProgramSelect) {
  const tableBody = document.querySelector(".js-programs-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-program");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const programId = button.dataset.programId;
    if (!programId) {
      return;
    }

    onProgramSelect(programId);
  });
}

/**
 * Updates the feedback message for the program catalog view.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setProgramsMessage(message, type = "") {
  const messageElement = document.querySelector("#programs-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Renders the hierarchical lookup screen for program details.
 * @param {object} options - State for the lookup screen.
 * @param {Array<object>} options.schools - Parent schools.
 * @param {Array<object>} options.departments - Departments for filtering.
 * @param {Array<object>} options.programs - Programs for selection.
 */
export function renderProgramLookupScreen({
  schools = [],
  departments = [],
  programs = [],
  selectedSchoolId = "",
  selectedDepartmentId = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = programs
    .map(
      (program) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(program.name))}</td>
          <td>${escapeHtml(formatFieldValue(program.code))}</td>
          <td>${escapeHtml(formatFieldValue(program.schoolName || program.schoolCode || program.schoolId))}</td>
          <td>${escapeHtml(
        formatFieldValue(program.departmentName || program.departmentCode || program.departmentId)
      )}</td>
          <td>
            <button type="button" class="row-action js-select-program" data-program-id="${escapeHtml(
        formatIdentifier(program.id)
      )}" ${formatIdentifier(program.id) ? "" : "disabled"}>Select</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2>Program Details</h2>
      <div class="users-search">
        <label for="program-lookup-school">
          Select School
          <select id="program-lookup-school" class="js-program-lookup-school">
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="program-lookup-department">
          Select Department
          <select id="program-lookup-department" class="js-program-lookup-department">
            ${renderDepartmentOptionsWithAll(departments, selectedDepartmentId)}
          </select>
        </label>
        <label for="program-lookup-program">
          Select Program
          <select id="program-lookup-program" class="js-program-lookup-program">
            ${renderProgramOptions(programs)}
          </select>
        </label>
      </div>
      <p class="form-message" id="program-lookup-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>School</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-programs-table-body">
            ${rows || '<tr><td colspan="5">No programs found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Binds the cascading filters in the program lookup UI.
 * @param {object} params - Event handlers for filters.
 */
export function bindProgramLookupFilters({ onSchoolChange, onDepartmentChange, onProgramChange }) {
  const schoolSelect = document.querySelector(".js-program-lookup-school");
  const departmentSelect = document.querySelector(".js-program-lookup-department");
  const programSelect = document.querySelector(".js-program-lookup-program");

  if (schoolSelect instanceof HTMLSelectElement) {
    schoolSelect.addEventListener("change", () => onSchoolChange(schoolSelect.value));
  }

  if (departmentSelect instanceof HTMLSelectElement) {
    departmentSelect.addEventListener("change", () => onDepartmentChange(departmentSelect.value));
  }

  if (programSelect instanceof HTMLSelectElement) {
    programSelect.addEventListener("change", () => onProgramChange(programSelect.value));
  }
}

/**
 * Updates the feedback message for the program lookup view.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setProgramLookupMessage(message, type = "") {
  const messageElement = document.querySelector("#program-lookup-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Renders the detailed profile view of a specific program.
 * @param {object} program - Program data to display.
 */
export function renderProgramDetailsScreen(program) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const programId = formatIdentifier(program.id);
  content.innerHTML = `
    <section class="panel users-panel js-program-details-panel" data-program-id="${escapeHtml(programId)}">
      ${renderDetailsHtml(program, "Program Details")}
      <p class="form-message" id="program-details-message" role="status" aria-live="polite"></p>
      <div class="user-modal-actions">
        <button type="button" class="js-program-view-details-btn">View Details</button>
        <button type="button" class="js-program-update-details-btn">Update Details</button>
        <button type="button" class="danger js-program-delete-btn">Delete Program</button>
        <button type="button" class="js-program-add-course-btn">Add Course To Program</button>
        <button type="button" class="js-program-all-courses-btn">All Courses In Program</button>
        <button type="button" class="ghost js-program-close-btn">Close</button>
      </div>
    </section>`;
}

/**
 * Binds the action buttons (Update/Delete/Add Course) on the program detail screen.
 * @param {object} handlers - Action callback handlers.
 */
export function bindProgramDetailsActions({
  onViewDetails,
  onUpdateDetails,
  onDeleteProgram,
  onAddCourse,
  onAllCourses,
  onClose
}) {
  const panel = document.querySelector(".js-program-details-panel");
  if (!panel) {
    return;
  }

  const viewDetailsButton = panel.querySelector(".js-program-view-details-btn");
  const updateDetailsButton = panel.querySelector(".js-program-update-details-btn");
  const deleteProgramButton = panel.querySelector(".js-program-delete-btn");
  const addCourseButton = panel.querySelector(".js-program-add-course-btn");
  const allCoursesButton = panel.querySelector(".js-program-all-courses-btn");
  const closeButton = panel.querySelector(".js-program-close-btn");

  const invokeWithProgramId = (callback) => {
    if (!callback) {
      return;
    }

    const programId = panel.getAttribute("data-program-id");
    if (!programId) {
      return;
    }

    callback(programId);
  };

  if (viewDetailsButton instanceof HTMLButtonElement) {
    viewDetailsButton.addEventListener("click", () => invokeWithProgramId(onViewDetails));
  }
  if (updateDetailsButton instanceof HTMLButtonElement) {
    updateDetailsButton.addEventListener("click", () => invokeWithProgramId(onUpdateDetails));
  }
  if (deleteProgramButton instanceof HTMLButtonElement) {
    deleteProgramButton.addEventListener("click", () => invokeWithProgramId(onDeleteProgram));
  }
  if (addCourseButton instanceof HTMLButtonElement) {
    addCourseButton.addEventListener("click", () => invokeWithProgramId(onAddCourse));
  }
  if (allCoursesButton instanceof HTMLButtonElement) {
    allCoursesButton.addEventListener("click", () => invokeWithProgramId(onAllCourses));
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => {
      if (onClose) {
        onClose();
      }
    });
  }
}

/**
 * Updates the feedback message for the program details view.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setProgramDetailsMessage(message, type = "") {
  const messageElement = document.querySelector("#program-details-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Renders the form for updating program attributes.
 * @param {object} program - Existing program data.
 */
export function renderProgramUpdateForm(program) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const programId = formatIdentifier(program.id);
  content.innerHTML = `
    <section class="panel users-panel js-program-update-panel" data-program-id="${escapeHtml(programId)}">
      <h2>Update Program Details</h2>
      <form class="create-user-form" id="update-program-form">
        <label for="update-program-name">
          Program Name
          <input type="text" id="update-program-name" name="name" value="${escapeHtml(
    formatIdentifier(program.name)
  )}" required>
        </label>
        <label for="update-program-code">
          Program Code
          <input type="text" id="update-program-code" name="code" value="${escapeHtml(
    formatIdentifier(program.code)
  )}" required>
        </label>
        <div class="user-modal-actions">
          <button type="submit">Submit</button>
          <button type="button" class="ghost js-close-update-program">Close</button>
        </div>
        <p class="form-message" id="update-program-message" role="status" aria-live="polite"></p>
      </form>
    </section>`;
}

/**
 * Binds the submission and close events of the program update form.
 * @param {Function} onSubmit - Callback receiving the updated program data.
 * @param {Function} onClose - Callback to exit the update view.
 */
export function bindProgramUpdateForm(onSubmit, onClose) {
  const form = document.querySelector("#update-program-form");
  const closeButton = document.querySelector(".js-close-update-program");
  const panel = document.querySelector(".js-program-update-panel");

  if (form && panel) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      onSubmit({
        programId: panel.getAttribute("data-program-id") || "",
        name: (formData.get("name") || "").toString().trim(),
        code: (formData.get("code") || "").toString().trim()
      });
    });
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => onClose());
  }
}

/**
 * Updates the feedback message for the program update form.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setUpdateProgramMessage(message, type = "") {
  const messageElement = document.querySelector("#update-program-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Sets the loading state for the program update submit button.
 * @param {boolean} isSubmitting - Whether the request is active.
 */
export function setUpdateProgramSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#update-program-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Updating..." : "Submit";
}

/**
 * Renders the form for associating a course with a program.
 * @param {object} options - Initial form state and data selection.
 * @param {object} options.program - The target program.
 * @param {Array<object>} options.schools - Schools for course catalog filtering.
 * @param {Array<object>} options.courses - Available courses in selected school.
 * @param {string|number} options.selectedSchoolId - Currently active school filter.
 */
export function renderAddCourseToProgramForm({
  program = {},
  schools = [],
  courses = [],
  selectedSchoolId = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const programId = formatIdentifier(program.id);
  content.innerHTML = `
    <section class="panel users-panel js-program-add-course-panel" data-program-id="${escapeHtml(programId)}">
      <h2>Add Course To Program</h2>
      <p><strong>Program:</strong> ${escapeHtml(formatFieldValue(program.name))} (${escapeHtml(
    formatFieldValue(program.code)
  )})</p>
      <form class="create-user-form" id="add-course-to-program-form">
        <label for="program-course-school-id">
          School
          <select id="program-course-school-id" name="schoolId" class="js-program-course-school-select" required>
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="program-course-id">
          Course
          <select id="program-course-id" name="courseId" class="js-program-course-select" required>
            ${renderCourseOptions(courses)}
          </select>
        </label>
        <label for="program-course-type">
          Course Type
          <select id="program-course-type" name="courseType" required>
            <option value="ELECTIVE">ELECTIVE</option>
            <option value="CORE">CORE</option>
          </select>
        </label>
        <label for="program-year-of-study">
          Year Of Study
          <select id="program-year-of-study" name="yearOfStudy" required>
            ${renderYearOptions(1, 6, 1)}
          </select>
        </label>
        <div class="user-modal-actions">
          <button type="submit">Add Course</button>
          <button type="button" class="ghost js-close-add-course-program">Close</button>
        </div>
        <p class="form-message" id="add-course-program-message" role="status" aria-live="polite"></p>
      </form>
    </section>`;
}

/**
 * Binds the school filter change in the "Add Course to Program" form.
 * @param {Function} onSchoolChange - Callback receiving the selected School ID.
 */
export function bindProgramCourseSchoolChange(onSchoolChange) {
  const schoolSelect = document.querySelector(".js-program-course-school-select");
  if (!(schoolSelect instanceof HTMLSelectElement)) {
    return;
  }

  schoolSelect.addEventListener("change", () => onSchoolChange(schoolSelect.value));
}

/**
 * Updates the course dropdown options in the association form.
 * @param {Array<object>} courses - Course data for the dropdown.
 */
export function setProgramCourseOptions(courses) {
  const courseSelect = document.querySelector(".js-program-course-select");
  if (!(courseSelect instanceof HTMLSelectElement)) {
    return;
  }

  courseSelect.innerHTML = renderCourseOptions(courses);
}

/**
 * Binds the submission and close events for the Course-to-Program association form.
 * @param {Function} onSubmit - Callback receiving {programId, schoolId, courseId, courseType, yearOfStudy}.
 * @param {Function} onClose - Callback to exit the association view.
 */
export function bindAddCourseToProgramForm(onSubmit, onClose) {
  const form = document.querySelector("#add-course-to-program-form");
  const closeButton = document.querySelector(".js-close-add-course-program");
  const panel = document.querySelector(".js-program-add-course-panel");

  if (form && panel) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      onSubmit({
        programId: panel.getAttribute("data-program-id") || "",
        schoolId: (formData.get("schoolId") || "").toString().trim(),
        courseId: (formData.get("courseId") || "").toString().trim(),
        courseType: (formData.get("courseType") || "").toString().trim(),
        yearOfStudy: Number((formData.get("yearOfStudy") || "0").toString())
      });
    });
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => onClose());
  }
}

/**
 * Updates the feedback message for the course association workflow.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setAddCourseToProgramMessage(message, type = "") {
  const messageElement = document.querySelector("#add-course-program-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Sets the loading state for the course-to-program association submit button.
 * @param {boolean} isSubmitting - Whether the request is active.
 */
export function setAddCourseToProgramSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#add-course-to-program-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Adding..." : "Add Course";
}

/**
 * Renders the screen showing all courses within a specific program.
 * @param {object} program - Program data.
 * @param {Array<object>} courses - Collection of courses in the program.
 */
export function renderProgramCoursesScreen(program, courses) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const programId = formatIdentifier(program.id);
  const rows = courses
    .map(
      (course) => `
      <tr>
        <td>${escapeHtml(formatFieldValue(course.courseTitle || course.title))}</td>
        <td>${escapeHtml(formatFieldValue(course.courseCode || course.code))}</td>
        <td>${escapeHtml(formatFieldValue(course.creditUnits))}</td>
        <td>${renderCourseTypeBadge(course.courseType)}</td>
        <td>${escapeHtml(formatFieldValue(course.yearOfStudy))}</td>
        <td>
          <button
            type="button"
            class="row-action js-select-program-course"
            data-course-id="${escapeHtml(formatIdentifier(course.courseId || course.id))}"
            ${formatIdentifier(course.courseId || course.id) ? "" : "disabled"}
          >Select</button>
        </td>
      </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel js-program-courses-panel" data-program-id="${escapeHtml(programId)}">
      <h2>All Courses In Program</h2>
      <p><strong>Program:</strong> ${escapeHtml(formatFieldValue(program.name))} (${escapeHtml(
    formatFieldValue(program.code)
  )})</p>
      <p class="form-message" id="program-courses-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Course Code</th>
              <th>Credit Units</th>
              <th>Type</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-program-courses-table-body">
            ${rows || '<tr><td colspan="6">No courses found for this program.</td></tr>'}
          </tbody>
        </table>
      </div>
      <section class="panel js-selected-program-course-panel" hidden></section>
      <div class="user-modal-actions">
        <button type="button" class="ghost js-close-program-courses">Close</button>
      </div>
    </section>`;
}

/**
 * Binds the selection of a course version from the program courses table.
 * @param {Function} onSelect - Callback receiving the selected course version ID.
 */
export function bindProgramCourseSelect(onSelect) {
  const tableBody = document.querySelector(".js-program-courses-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-program-course");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const courseId = button.dataset.courseId;
    if (!courseId) {
      return;
    }

    onSelect(courseId);
  });
}

/**
 * Binds the close action for the program courses catalog.
 * @param {Function} onClose - Navigation callback.
 */
export function bindProgramCoursesClose(onClose) {
  const closeButton = document.querySelector(".js-close-program-courses");
  if (!(closeButton instanceof HTMLButtonElement)) {
    return;
  }

  closeButton.addEventListener("click", () => onClose());
}

/**
 * Renders render selected program course actions.
 * @param {object} course
 * @returns {void}
 */
export function renderSelectedProgramCourseActions(course) {
  const panel = document.querySelector(".js-selected-program-course-panel");
  const parentPanel = document.querySelector(".js-program-courses-panel");
  if (!panel || !parentPanel) {
    return;
  }

  const programId = parentPanel.getAttribute("data-program-id") || "";
  const courseId = formatIdentifier(course.courseId || course.id);

  panel.hidden = false;
  panel.innerHTML = `
    <h3>Selected Course</h3>
    <dl class="created-user-grid">
      <div class="created-user-item"><dt>Title</dt><dd>${escapeHtml(
    formatFieldValue(course.courseTitle || course.title)
  )}</dd></div>
      <div class="created-user-item"><dt>Code</dt><dd>${escapeHtml(
    formatFieldValue(course.courseCode || course.code)
  )}</dd></div>
      <div class="created-user-item"><dt>Type</dt><dd>${escapeHtml(
    formatFieldValue(course.courseType)
  )}</dd></div>
      <div class="created-user-item"><dt>Year</dt><dd>${escapeHtml(
    formatFieldValue(course.yearOfStudy)
  )}</dd></div>
    </dl>
    <p class="form-message" id="selected-program-course-message" role="status" aria-live="polite"></p>
    <div class="user-modal-actions">
      <button type="button" class="danger js-remove-program-course-btn" data-program-id="${escapeHtml(
    programId
  )}" data-course-id="${escapeHtml(courseId)}">Remove Course</button>
      <button type="button" class="js-edit-program-course-btn" data-program-id="${escapeHtml(
    programId
  )}" data-course-id="${escapeHtml(courseId)}">Edit Course Details</button>
      <button type="button" class="ghost js-close-selected-program-course-btn">Close Selection</button>
    </div>`;
}

/**
 * Binds bind selected program course actions.
 * @param {object} params
 * @param {*} params.onRemove
 * @param {*} params.onEdit
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindSelectedProgramCourseActions({ onRemove, onEdit, onClose }) {
  const removeButton = document.querySelector(".js-remove-program-course-btn");
  const editButton = document.querySelector(".js-edit-program-course-btn");
  const closeButton = document.querySelector(".js-close-selected-program-course-btn");

  if (removeButton instanceof HTMLButtonElement) {
    removeButton.addEventListener("click", () => {
      onRemove({
        programId: removeButton.dataset.programId || "",
        courseId: removeButton.dataset.courseId || ""
      });
    });
  }

  if (editButton instanceof HTMLButtonElement) {
    editButton.addEventListener("click", () => {
      onEdit({
        programId: editButton.dataset.programId || "",
        courseId: editButton.dataset.courseId || ""
      });
    });
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => onClose());
  }
}

/**
 * Hides hide selected program course actions.
 * @returns {void}
 */
export function hideSelectedProgramCourseActions() {
  const panel = document.querySelector(".js-selected-program-course-panel");
  if (!panel) {
    return;
  }

  panel.hidden = true;
  panel.innerHTML = "";
}

/**
 * Opens open program course edit modal.
 * @param {object} course
 * @returns {void}
 */
export function openProgramCourseEditModal(course) {
  closeProgramCourseEditModal();

  const courseType = normalizeCourseTypeForSelect(course.courseType);
  const yearOfStudy = Number(course.yearOfStudy || 1);
  const overlay = document.createElement("div");
  overlay.className = "user-modal-overlay js-edit-program-course-modal-overlay";
  overlay.innerHTML = `
    <div class="user-modal" role="dialog" aria-modal="true" aria-labelledby="edit-program-course-title">
      <h3 id="edit-program-course-title">Edit Course Details</h3>
      <p><strong>Course:</strong> ${escapeHtml(formatFieldValue(course.courseTitle || course.title))} (${escapeHtml(
    formatFieldValue(course.courseCode || course.code)
  )})</p>
      <form class="create-user-form" id="edit-program-course-form">
        <label for="edit-program-course-type">
          Course Type
          <select id="edit-program-course-type" name="courseType" required>
            <option value="ELECTIVE" ${courseType === "ELECTIVE" ? "selected" : ""}>ELECTIVE</option>
            <option value="CORE" ${courseType === "CORE" ? "selected" : ""}>CORE</option>
          </select>
        </label>
        <label for="edit-program-course-year">
          Year Of Study
          <select id="edit-program-course-year" name="yearOfStudy" required>
            ${renderYearOptions(1, 6, yearOfStudy)}
          </select>
        </label>
        <div class="user-modal-actions">
          <button type="submit">Save Changes</button>
          <button type="button" class="ghost js-close-edit-program-course-modal">Close</button>
        </div>
      </form>
      <p class="form-message" id="edit-program-course-message" role="status" aria-live="polite"></p>
    </div>`;

  document.body.appendChild(overlay);
}

/**
 * Binds bind program course edit modal.
 * @param {object} params
 * @param {*} params.onSubmit
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindProgramCourseEditModal({ onSubmit, onClose }) {
  const overlay = document.querySelector(".js-edit-program-course-modal-overlay");
  const form = document.querySelector("#edit-program-course-form");
  const closeButton = document.querySelector(".js-close-edit-program-course-modal");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      onSubmit({
        courseType: (formData.get("courseType") || "").toString().trim(),
        yearOfStudy: Number((formData.get("yearOfStudy") || "1").toString())
      });
    });
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => {
      closeProgramCourseEditModal();
      if (onClose) {
        onClose();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeProgramCourseEditModal();
        if (onClose) {
          onClose();
        }
      }
    });
  }
}

/**
 * Sets set program course edit modal message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setProgramCourseEditModalMessage(message, type = "") {
  const messageElement = document.querySelector("#edit-program-course-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Sets set program course edit modal submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setProgramCourseEditModalSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#edit-program-course-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Saving..." : "Save Changes";
}

/**
 * Closes close program course edit modal.
 * @returns {void}
 */
export function closeProgramCourseEditModal() {
  const overlay = document.querySelector(".js-edit-program-course-modal-overlay");
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Sets set program courses message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setProgramCoursesMessage(message, type = "") {
  const messageElement = document.querySelector("#program-courses-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Sets set selected program course message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setSelectedProgramCourseMessage(message, type = "") {
  const messageElement = document.querySelector("#selected-program-course-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Renders the comprehensive program details including course requirements by year.
 * @param {object} program - Program data.
 * @param {Array<object>} [courses=[]] - Collection of associated courses.
 * @param {number} [selectedYear=1] - Currently filtered year of study.
 */
export function renderProgramFullDetailsScreen(program, courses = [], selectedYear = 1) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const programId = formatIdentifier(program.id);
  const filteredCourses = courses.filter(
    (course) => Number(course.yearOfStudy || 0) === Number(selectedYear)
  );
  const rows = filteredCourses
    .map(
      (course) => `
      <tr>
        <td>${escapeHtml(formatFieldValue(course.courseTitle || course.title))}</td>
        <td>${escapeHtml(formatFieldValue(course.courseCode || course.code))}</td>
        <td>${escapeHtml(formatFieldValue(course.creditUnits))}</td>
        <td>${renderCourseTypeBadge(course.courseType)}</td>
      </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel js-program-full-details-panel" data-program-id="${escapeHtml(programId)}">
      ${renderDetailsHtml(program, "Program Full Details")}
      <label for="program-details-year-filter">
        Year Offered
        <select id="program-details-year-filter" class="js-program-details-year-filter">
          ${renderYearOptions(1, 6, selectedYear)}
        </select>
      </label>
      <p class="form-message" id="program-full-details-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Course Code</th>
              <th>Credit Units</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4">No courses found for selected year.</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="user-modal-actions">
        <button type="button" class="ghost js-close-program-full-details">Close</button>
      </div>
    </section>`;
}

/**
 * Binds events for the program full details screen (year filtering and closure).
 * @param {object} params - Event handlers.
 */
export function bindProgramFullDetailsActions({ onYearChange, onClose }) {
  const yearSelect = document.querySelector(".js-program-details-year-filter");
  const closeButton = document.querySelector(".js-close-program-full-details");

  if (yearSelect instanceof HTMLSelectElement) {
    yearSelect.addEventListener("change", () => onYearChange(Number(yearSelect.value)));
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => onClose());
  }
}

/**
 * Updates the feedback message for the program full details view.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setProgramFullDetailsMessage(message, type = "") {
  const messageElement = document.querySelector("#program-full-details-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Renders HTML option elements for university schools.
 * @param {Array<object>} schools - School data.
 * @param {string|number} [selectedSchoolId] - Pre-selected ID.
 * @returns {string} HTML string of options.
 */
function renderSchoolOptions(schools, selectedSchoolId) {
  if (!Array.isArray(schools) || schools.length === 0) {
    return `<option value="">No schools available</option>`;
  }

  const options = schools
    .map((school) => {
      const id = formatIdentifier(school.id || school.schoolId);
      const name = formatFieldValue(school.name || school.schoolName);
      const code = formatFieldValue(school.code || school.schoolCode);
      const selected = id && String(id) === String(selectedSchoolId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select School</option>${options}`;
}

/**
 * Renders HTML option elements for academic departments.
 * @param {Array<object>} departments - Department data.
 * @param {string|number} [selectedDepartmentId] - Pre-selected ID.
 * @returns {string} HTML string of options.
 */
function renderDepartmentOptions(departments, selectedDepartmentId) {
  if (!Array.isArray(departments) || departments.length === 0) {
    return `<option value="">No departments available</option>`;
  }

  const options = departments
    .map((department) => {
      const id = formatIdentifier(department.id || department.departmentId);
      const name = formatFieldValue(department.name || department.departmentName);
      const code = formatFieldValue(department.code || department.departmentCode);
      const selected = id && String(id) === String(selectedDepartmentId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select Department</option>${options}`;
}

/**
 * Renders HTML option elements for academic departments including an "All" option.
 * @param {Array<object>} departments - Department data.
 * @param {string|number} [selectedDepartmentId] - Pre-selected ID.
 * @returns {string} HTML string of options.
 */
function renderDepartmentOptionsWithAll(departments, selectedDepartmentId) {
  if (!Array.isArray(departments) || departments.length === 0) {
    return `<option value="">All Departments</option>`;
  }

  const options = departments
    .map((department) => {
      const id = formatIdentifier(department.id || department.departmentId);
      const name = formatFieldValue(department.name || department.departmentName);
      const code = formatFieldValue(department.code || department.departmentCode);
      const selected = id && String(id) === String(selectedDepartmentId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">All Departments</option>${options}`;
}

/**
 * Renders HTML option elements for academic programs.
 * @param {Array<object>} programs - Program data.
 * @returns {string} HTML string of options.
 */
function renderProgramOptions(programs) {
  if (!Array.isArray(programs) || programs.length === 0) {
    return `<option value="">No programs found</option>`;
  }

  const options = programs
    .map((program) => {
      const id = formatIdentifier(program.id);
      const name = formatFieldValue(program.name);
      const code = formatFieldValue(program.code);
      return `<option value="${escapeHtml(id)}">${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">All Programs</option>${options}`;
}

/**
 * Renders HTML option elements for university courses.
 * @param {Array<object>} courses - Course data.
 * @returns {string} HTML string of options.
 */
function renderCourseOptions(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return `<option value="">No courses available</option>`;
  }

  const options = courses
    .map((course) => {
      const courseId = formatIdentifier(course.id || course.courseId);
      const courseTitle = formatFieldValue(course.title || course.courseTitle);
      const courseCode = formatFieldValue(course.code || course.courseCode);
      return `<option value="${escapeHtml(courseId)}">${escapeHtml(
        `${courseTitle} (${courseCode})`
      )}</option>`;
    })
    .join("");

  return `<option value="">Select Course</option>${options}`;
}

/**
 * Renders HTML option elements for a range of years.
 * @param {number} startYear - Beginning year.
 * @param {number} endYear - Ending year.
 * @param {number} selectedYear - Currently selected value.
 * @returns {string} HTML string of options.
 */
function renderYearOptions(startYear, endYear, selectedYear) {
  const options = [];
  for (let year = startYear; year <= endYear; year += 1) {
    options.push(
      `<option value="${year}" ${Number(selectedYear) === year ? "selected" : ""}>Year ${year}</option>`
    );
  }

  return options.join("");
}

/**
 * Renders a stylized badge for course types (CORE vs ELECTIVE).
 * @param {string} courseType - The type of course.
 * @returns {string} HTML string of the badge.
 */
function renderCourseTypeBadge(courseType) {
  const normalizedType = formatFieldValue(courseType).toUpperCase();
  const isCore = normalizedType === "CORE";
  const badgeClass = isCore ? "core" : "elective";
  return `<span class="course-type-badge ${badgeClass}">${escapeHtml(normalizedType)}</span>`;
}

/**
 * Normalizes a course type string for use in HTML select elements.
 * @param {string} courseType - The raw course type value.
 * @returns {string} Normalized type ('CORE' or 'ELECTIVE').
 */
function normalizeCourseTypeForSelect(courseType) {
  const value = formatFieldValue(courseType).toUpperCase();
  return value === "CORE" ? "CORE" : "ELECTIVE";
}

/**
 * Renders the standardized list of program details based on metadata fields.
 * @param {object} program - Program data.
 * @param {string} title - Section header text.
 * @returns {string} HTML string of details.
 */
function renderDetailsHtml(program, title) {
  return `
    <h3>${escapeHtml(title)}</h3>
    <dl class="created-user-grid">
      ${PROGRAM_DETAIL_FIELDS.map(
    ({ label, key }) =>
      `<div class="created-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatFieldValue(program[key]))}</dd></div>`
  ).join("")}
    </dl>`;
}

/**
 * Formats a field value for display, providing a fallback for empty values.
 * @param {*} value - Raw value.
 * @returns {string} Displayable string.
 */
function formatFieldValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

/**
 * Formats a value as a string identifier.
 * @param {*} value - Raw identifier value.
 * @returns {string} Formatted ID.
 */
function formatIdentifier(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} value - Raw string.
 * @returns {string} Escaped string.
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Toggles the visibility of the primary hero section.
 * @param {boolean} isVisible - Target visibility state.
 */
function setHeroVisibility(isVisible) {
  const heroSection = document.querySelector(".hero");
  if (!heroSection) {
    return;
  }

  heroSection.hidden = !isVisible;
}
