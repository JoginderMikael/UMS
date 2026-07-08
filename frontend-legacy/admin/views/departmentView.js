/**
 * @fileoverview Presentation Layer for Academic Departments.
 * Handles the management of organizational units within Schools,
 * including creation, soft-deletion recovery, and curriculum overview.
 * @module admin/views/departmentView
 */
const DEPARTMENT_DETAIL_FIELDS = [
  { label: "Department ID", key: "id" },
  { label: "Department Name", key: "name" },
  { label: "Department Code", key: "code" },
  { label: "School ID", key: "schoolId" },
  { label: "School Name", key: "schoolName" },
  { label: "School Code", key: "schoolCode" }
];

/**
 * Binds triggers (sidebar or dashboard links) that launch the Department Creation form.
 * @param {Function} onCreateDepartmentRequest - Callback invoked when the user requests the form.
 */
export function bindCreateDepartmentTriggers(onCreateDepartmentRequest) {
  const createDepartmentLinks = document.querySelectorAll(".js-create-department");
  createDepartmentLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onCreateDepartmentRequest();
    });
  });
}

/**
 * Binds the sidebar trigger for viewing the comprehensive departments catalog.
 * @param {Function} onViewAllDepartmentsRequest - Navigation callback.
 */
export function bindViewAllDepartmentsTrigger(onViewAllDepartmentsRequest) {
  const viewAllDepartmentsLink = document.querySelector(".js-view-all-departments");
  if (!viewAllDepartmentsLink) {
    return;
  }

  viewAllDepartmentsLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewAllDepartmentsRequest();
  });
}

/**
 * Binds the sidebar trigger for viewing the archive of soft-deleted departments.
 * @param {Function} onViewDeletedDepartmentsRequest - Navigation callback.
 */
export function bindViewDeletedDepartmentsTrigger(onViewDeletedDepartmentsRequest) {
  const viewDeletedDepartmentsLink = document.querySelector(".js-view-deleted-departments");
  if (!viewDeletedDepartmentsLink) {
    return;
  }

  viewDeletedDepartmentsLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewDeletedDepartmentsRequest();
  });
}

/**
 * Renders the department registration form within the main content area.
 * @param {Array<object>} schools - Collection of schools for the parent dropdown.
 */
export function renderCreateDepartmentForm(schools = []) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel create-user-panel">
      <h2><i class="fas fa-sitemap"></i> Create Department</h2>
      <form class="create-user-form" id="create-department-form">
        <label for="department-school-id">
          <i class="fas fa-building"></i> School
          <select id="department-school-id" name="schoolId" required>
            ${renderSchoolOptions(schools)}
          </select>
        </label>
        <label for="department-name">
          <i class="fas fa-tag"></i> Department Name
          <input type="text" id="department-name" name="name" required>
        </label>
        <label for="department-code">
          <i class="fas fa-barcode"></i> Department Code
          <input type="text" id="department-code" name="code" required>
        </label>
        <button type="submit"><i class="fas fa-plus-circle"></i> Create Department</button>
        <p class="form-message" id="create-department-message" role="status" aria-live="polite"></p>
      </form>
      <div class="created-user-result" id="created-department-result" hidden></div>
    </section>`;
}

/**
 * Binds the submission event for the department registration form.
 * @param {Function} onSubmit - Callback receiving (schoolId, name, code) payload.
 */
export function bindCreateDepartmentSubmit(onSubmit) {
  const form = document.querySelector("#create-department-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    onSubmit({
      schoolId: (formData.get("schoolId") || "").toString().trim(),
      name: (formData.get("name") || "").toString().trim(),
      code: (formData.get("code") || "").toString().trim()
    });
  });
}

/**
 * Updates the feedback message specific to department creation operations.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setCreateDepartmentMessage(message, type = "") {
  const messageElement = document.querySelector("#create-department-message");
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
 * Toggles the interactive state of the department creation submit button.
 * @param {boolean} isSubmitting - Whether a creation request is in-flight.
 */
export function setCreateDepartmentSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#create-department-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Creating..." : "Create Department";
}

/**
 * Renders render created department details.
 * @param {object} department
 * @returns {void}
 */
export function renderCreatedDepartmentDetails(department) {
  const resultContainer = document.querySelector("#created-department-result");
  if (!resultContainer) {
    return;
  }

  if (!department || typeof department !== "object") {
    resultContainer.hidden = true;
    resultContainer.innerHTML = "";
    return;
  }

  resultContainer.innerHTML = renderDetailsHtml(department, "Created Department Details");
  resultContainer.hidden = false;
}

/**
 * Renders render departments screen.
 * @param {Array<*>} departments
 * @param {Array<*>} schools
 * @param {string|number} selectedSchoolId
 * @returns {void}
 */
export function renderDepartmentsScreen(departments, schools = [], selectedSchoolId = "") {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = departments
    .map(
      (department) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(department.name))}</td>
          <td>${escapeHtml(formatFieldValue(department.code))}</td>
          <td>${escapeHtml(formatFieldValue(department.schoolName || department.schoolCode || department.schoolId))}</td>
          <td>
            <button type="button" class="row-action js-select-department" data-department-id="${escapeHtml(
        formatIdentifier(department.id)
      )}" ${formatIdentifier(department.id) ? "" : "disabled"}>Select</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2>Departments</h2>
      <div class="users-search">
        <select class="js-department-school-filter">
          ${renderSchoolOptions(schools, selectedSchoolId)}
        </select>
        <input type="text" class="js-department-search-input" placeholder="Search by school, name, or code">
        <button type="button" class="js-department-search-btn">Search</button>
      </div>
      <p class="form-message" id="departments-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>School</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-departments-table-body">
            ${rows || '<tr><td colspan="4">No departments found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Renders render deleted departments screen.
 * @param {Array<*>} departments
 * @param {Array<*>} schools
 * @param {string|number} selectedSchoolId
 * @returns {void}
 */
export function renderDeletedDepartmentsScreen(departments, schools = [], selectedSchoolId = "") {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = departments
    .map(
      (department) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(department.name))}</td>
          <td>${escapeHtml(formatFieldValue(department.code))}</td>
          <td>${escapeHtml(formatFieldValue(department.schoolName || department.schoolCode || department.schoolId))}</td>
          <td>
            <button type="button" class="row-action js-restore-department"
              data-department-id="${escapeHtml(formatIdentifier(department.id))}"
              data-school-id="${escapeHtml(formatIdentifier(department.schoolId || selectedSchoolId))}"
              ${formatIdentifier(department.id) ? "" : "disabled"}>Restore</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-trash"></i> Deleted Departments</h2>
      <div class="users-search">
        <select class="js-deleted-department-school-filter">
          ${renderSchoolOptions(schools, selectedSchoolId)}
        </select>
      </div>
      <p class="form-message" id="departments-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>School</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-deleted-departments-table-body">
            ${rows || '<tr><td colspan="4">No deleted departments found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Binds bind department school filter.
 * @param {object} onChangeSchool
 * @returns {void}
 */
export function bindDepartmentSchoolFilter(onChangeSchool) {
  const schoolFilter = document.querySelector(".js-department-school-filter");
  if (!(schoolFilter instanceof HTMLSelectElement)) {
    return;
  }

  schoolFilter.addEventListener("change", () => {
    onChangeSchool(schoolFilter.value);
  });
}

/**
 * Binds bind deleted department school filter.
 * @param {object} onChangeSchool
 * @returns {void}
 */
export function bindDeletedDepartmentSchoolFilter(onChangeSchool) {
  const schoolFilter = document.querySelector(".js-deleted-department-school-filter");
  if (!(schoolFilter instanceof HTMLSelectElement)) {
    return;
  }

  schoolFilter.addEventListener("change", () => {
    onChangeSchool(schoolFilter.value);
  });
}

/**
 * Binds bind departments search.
 * @param {*} onSearch
 * @returns {void}
 */
export function bindDepartmentsSearch(onSearch) {
  const searchButton = document.querySelector(".js-department-search-btn");
  const searchInput = document.querySelector(".js-department-search-input");
  if (!searchButton || !searchInput) {
    return;
  }

  const submitSearch = () => {
    onSearch(searchInput.value.trim());
  };

  searchButton.addEventListener("click", submitSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  });
}

/**
 * Binds bind department select.
 * @param {object} onDepartmentSelect
 * @returns {void}
 */
export function bindDepartmentSelect(onDepartmentSelect) {
  const tableBody = document.querySelector(".js-departments-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-department");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const departmentId = button.dataset.departmentId;
    if (!departmentId) {
      return;
    }

    onDepartmentSelect(departmentId);
  });
}

/**
 * Binds bind deleted department restore.
 * @param {object} onRestoreDepartment
 * @returns {void}
 */
export function bindDeletedDepartmentRestore(onRestoreDepartment) {
  const tableBody = document.querySelector(".js-deleted-departments-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-restore-department");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const departmentId = button.dataset.departmentId;
    const schoolId = button.dataset.schoolId;
    if (!departmentId || !schoolId) {
      return;
    }

    onRestoreDepartment(schoolId, departmentId);
  });
}

/**
 * Sets set departments message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setDepartmentsMessage(message, type = "") {
  const messageElement = document.querySelector("#departments-message");
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
 * Opens open department modal.
 * @param {object} department
 * @returns {void}
 */
export function openDepartmentModal(department) {
  closeDepartmentModal();

  const departmentId = formatIdentifier(department.id);
  const schoolId = formatIdentifier(department.schoolId);
  const overlay = document.createElement("div");
  overlay.className = "user-modal-overlay js-department-modal-overlay";
  overlay.innerHTML = `
    <div
      class="user-modal"
      data-department-id="${escapeHtml(departmentId)}"
      data-school-id="${escapeHtml(schoolId)}"
    >
      ${renderDetailsHtml(department, "Department Details")}
      <h4>Update Department</h4>
      <form id="department-update-form" class="user-update-form">
        <label for="modal-department-name">
          Department Name
          <input type="text" id="modal-department-name" name="name" value="${escapeHtml(
    formatFieldValueForInput(department.name)
  )}" required>
        </label>
        <label for="modal-department-code">
          Department Code
          <input type="text" id="modal-department-code" name="code" value="${escapeHtml(
    formatFieldValueForInput(department.code)
  )}" required>
        </label>
        <p class="form-message" id="department-modal-message" role="status" aria-live="polite"></p>
        <div class="user-modal-actions">
          <button type="submit" class="js-department-modal-update-btn">Submit</button>
          <button type="button" class="js-department-modal-view-programs-btn">View Department Programs</button>
          <button type="button" class="danger js-department-modal-delete-btn">Delete Department</button>
          <button type="button" class="ghost js-department-modal-close-btn">Close</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
}

/**
 * Closes close department modal.
 * @returns {void}
 */
export function closeDepartmentModal() {
  const overlay = document.querySelector(".js-department-modal-overlay");
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Binds bind department modal actions.
 * @param {object} params
 * @param {*} params.onUpdate
 * @param {*} params.onDelete
 * @param {*} params.onViewPrograms
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindDepartmentModalActions({ onUpdate, onDelete, onViewPrograms, onClose }) {
  const overlay = document.querySelector(".js-department-modal-overlay");
  if (!overlay) {
    return;
  }

  const modal = overlay.querySelector(".user-modal");
  const form = overlay.querySelector("#department-update-form");
  const viewProgramsButton = overlay.querySelector(".js-department-modal-view-programs-btn");
  const deleteButton = overlay.querySelector(".js-department-modal-delete-btn");
  const closeButton = overlay.querySelector(".js-department-modal-close-btn");

  if (form && modal && onUpdate) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const departmentId = modal.getAttribute("data-department-id");
      const schoolId = modal.getAttribute("data-school-id");
      if (!departmentId || !schoolId) {
        return;
      }

      const formData = new FormData(form);
      onUpdate(schoolId, departmentId, {
        name: (formData.get("name") || "").toString().trim(),
        code: (formData.get("code") || "").toString().trim()
      });
    });
  }

  if (viewProgramsButton instanceof HTMLButtonElement && modal && onViewPrograms) {
    viewProgramsButton.addEventListener("click", () => {
      const departmentId = modal.getAttribute("data-department-id");
      const schoolId = modal.getAttribute("data-school-id");
      if (!departmentId || !schoolId) {
        return;
      }

      onViewPrograms(schoolId, departmentId);
    });
  }

  if (deleteButton instanceof HTMLButtonElement && modal && onDelete) {
    deleteButton.addEventListener("click", () => {
      const departmentId = modal.getAttribute("data-department-id");
      const schoolId = modal.getAttribute("data-school-id");
      if (!departmentId || !schoolId) {
        return;
      }

      onDelete(schoolId, departmentId);
    });
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => {
      closeDepartmentModal();
      if (onClose) {
        onClose();
      }
    });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeDepartmentModal();
      if (onClose) {
        onClose();
      }
    }
  });
}

/**
 * Sets set department modal message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setDepartmentModalMessage(message, type = "") {
  const messageElement = document.querySelector("#department-modal-message");
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
 * Sets set department modal submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setDepartmentModalSubmitting(isSubmitting) {
  const updateButton = document.querySelector(".js-department-modal-update-btn");
  const viewProgramsButton = document.querySelector(".js-department-modal-view-programs-btn");
  const deleteButton = document.querySelector(".js-department-modal-delete-btn");

  if (updateButton instanceof HTMLButtonElement) {
    updateButton.disabled = isSubmitting;
    updateButton.textContent = isSubmitting ? "Saving..." : "Submit";
  }

  if (viewProgramsButton instanceof HTMLButtonElement) {
    viewProgramsButton.disabled = isSubmitting;
  }

  if (deleteButton instanceof HTMLButtonElement) {
    deleteButton.disabled = isSubmitting;
  }
}

/**
 * Opens open department programs modal.
 * @param {object} department
 * @param {Array<*>} programs
 * @returns {void}
 */
export function openDepartmentProgramsModal(department, programs = []) {
  closeDepartmentModal();

  const departmentId = formatIdentifier(department.id || department.departmentId);
  const schoolId = formatIdentifier(department.schoolId);
  const rows = programs
    .map(
      (program) => `
      <tr>
        <td>${escapeHtml(formatFieldValue(program.name || program.programName))}</td>
        <td>${escapeHtml(formatFieldValue(program.code || program.programCode))}</td>
        <td>
          <button type="button" class="row-action js-select-department-program"
            data-program-id="${escapeHtml(formatIdentifier(program.id || program.programId))}"
            ${formatIdentifier(program.id || program.programId) ? "" : "disabled"}>Select</button>
        </td>
      </tr>`
    )
    .join("");

  const overlay = document.createElement("div");
  overlay.className = "user-modal-overlay js-department-modal-overlay";
  overlay.innerHTML = `
    <div class="user-modal" data-department-id="${escapeHtml(departmentId)}" data-school-id="${escapeHtml(
    schoolId
  )}">
      <h3>${escapeHtml(`Programs - ${formatFieldValue(department.name)}`)}</h3>
      <p class="form-message" id="department-modal-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-department-programs-table-body">
            ${rows || '<tr><td colspan="3">No programs found for this department.</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="created-user-result js-department-program-details" hidden></div>
      <div class="user-modal-actions">
        <button type="button" class="ghost js-department-modal-back-btn">Back to Department Details</button>
        <button type="button" class="ghost js-department-modal-close-btn">Close</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

/**
 * Binds bind department programs actions.
 * @param {object} params
 * @param {*} params.onProgramSelect
 * @param {*} params.onBack
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindDepartmentProgramsActions({ onProgramSelect, onBack, onClose }) {
  const overlay = document.querySelector(".js-department-modal-overlay");
  if (!overlay) {
    return;
  }

  const tableBody = overlay.querySelector(".js-department-programs-table-body");
  const backButton = overlay.querySelector(".js-department-modal-back-btn");
  const closeButton = overlay.querySelector(".js-department-modal-close-btn");

  if (tableBody && onProgramSelect) {
    tableBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest(".js-select-department-program");
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

  if (backButton instanceof HTMLButtonElement && onBack) {
    backButton.addEventListener("click", onBack);
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => {
      closeDepartmentModal();
      if (onClose) {
        onClose();
      }
    });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeDepartmentModal();
      if (onClose) {
        onClose();
      }
    }
  });
}

/**
 * Renders render selected department program details.
 * @param {object} program
 * @returns {void}
 */
export function renderSelectedDepartmentProgramDetails(program) {
  const detailsContainer = document.querySelector(".js-department-program-details");
  if (!detailsContainer) {
    return;
  }

  if (!program || typeof program !== "object") {
    detailsContainer.hidden = true;
    detailsContainer.innerHTML = "";
    return;
  }

  const detailFields = [
    { label: "Program ID", value: program.id || program.programId },
    { label: "Program Name", value: program.name || program.programName },
    { label: "Program Code", value: program.code || program.programCode },
    { label: "School Name", value: program.schoolName },
    { label: "School Code", value: program.schoolCode },
    { label: "Department Name", value: program.departmentName },
    { label: "Department Code", value: program.departmentCode }
  ];

  detailsContainer.innerHTML = `
    <h4>Program Details</h4>
    <dl class="created-user-grid">
      ${detailFields
      .map(
        (field) =>
          `<div class="created-user-item"><dt>${escapeHtml(field.label)}</dt><dd>${escapeHtml(
            formatFieldValue(field.value)
          )}</dd></div>`
      )
      .join("")}
    </dl>`;
  detailsContainer.hidden = false;
}

/**
 * Renders render school options.
 * @param {Array<*>} schools
 * @param {string|number} selectedSchoolId
 * @returns {void}
 */
function renderSchoolOptions(schools, selectedSchoolId = "") {
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
 * Renders render details html.
 * @param {object} department
 * @param {*} title
 * @returns {void}
 */
function renderDetailsHtml(department, title) {
  return `
    <h3>${escapeHtml(title)}</h3>
    <dl class="created-user-grid">
      ${DEPARTMENT_DETAIL_FIELDS.map(
    ({ label, key }) =>
      `<div class="created-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatFieldValue(department[key]))}</dd></div>`
  ).join("")}
    </dl>`;
}

/**
 * Formats format field value.
 * @param {*} value
 * @returns {string}
 */
function formatFieldValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

/**
 * Formats format identifier.
 * @param {*} value
 * @returns {string}
 */
function formatIdentifier(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

/**
 * Formats format field value for input.
 * @param {*} value
 * @returns {string}
 */
function formatFieldValueForInput(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

/**
 * Executes escape html.
 * @param {*} value
 * @returns {string}
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
 * Sets set hero visibility.
 * @param {boolean} isVisible
 * @returns {void}
 */
function setHeroVisibility(isVisible) {
  const heroSection = document.querySelector(".hero");
  if (!heroSection) {
    return;
  }

  heroSection.hidden = !isVisible;
}
