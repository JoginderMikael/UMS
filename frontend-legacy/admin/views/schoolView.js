/**
 * @fileoverview Presentation Layer for University Schools.
 * Handles the administrative UI for high-level organizational units,
 * including creation, cataloging, and soft-deletion recovery.
 * @module admin/views/schoolView
 */
const SCHOOL_DETAIL_FIELDS = [
  { label: "School ID", key: "id" },
  { label: "School Name", key: "name" },
  { label: "School Code", key: "code" }
];

/**
 * Binds triggers (sidebar or dashboard buttons) that initiate the School Creation form.
 * @param {Function} onCreateSchoolRequest - Initialization callback.
 */
export function bindCreateSchoolTriggers(onCreateSchoolRequest) {
  const createSchoolTriggers = document.querySelectorAll(".js-create-school");
  createSchoolTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      onCreateSchoolRequest();
    });
  });
}

/**
 * Binds the sidebar trigger for viewing the comprehensive schools catalog.
 * @param {Function} onViewAllSchoolsRequest - Navigation callback.
 */
export function bindViewAllSchoolsTrigger(onViewAllSchoolsRequest) {
  const viewAllSchoolsLink = document.querySelector(".js-view-all-schools");
  if (!viewAllSchoolsLink) {
    return;
  }

  viewAllSchoolsLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewAllSchoolsRequest();
  });
}

/**
 * Binds the sidebar trigger for viewing the archive of soft-deleted schools.
 * @param {Function} onViewDeletedSchoolsRequest - Navigation callback.
 */
export function bindViewDeletedSchoolsTrigger(onViewDeletedSchoolsRequest) {
  const viewDeletedSchoolsLink = document.querySelector(".js-view-deleted-schools");
  if (!viewDeletedSchoolsLink) {
    return;
  }

  viewDeletedSchoolsLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewDeletedSchoolsRequest();
  });
}

/**
 * Renders the school registration form in the main content area.
 */
export function renderCreateSchoolForm() {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel create-user-panel">
      <h2><i class="fas fa-building"></i> Create School</h2>
      <form class="create-user-form" id="create-school-form">
        <label for="school-name">
          <i class="fas fa-school"></i> School Name
          <input type="text" id="school-name" name="name" required>
        </label>
        <label for="school-code">
          <i class="fas fa-barcode"></i> School Code
          <input type="text" id="school-code" name="code" required>
        </label>
        <button type="submit"><i class="fas fa-plus-circle"></i> Create School</button>
        <p class="form-message" id="create-school-message" role="status" aria-live="polite"></p>
      </form>
      <div class="created-user-result" id="created-school-result" hidden></div>
    </section>`;
}

/**
 * Binds the submission event for the school registration form.
 * @param {Function} onSubmit - Callback receiving the school data payload.
 */
export function bindCreateSchoolSubmit(onSubmit) {
  const form = document.querySelector("#create-school-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    onSubmit({
      name: (formData.get("name") || "").toString().trim(),
      code: (formData.get("code") || "").toString().trim()
    });
  });
}

/**
 * Updates the global feedback message for school-related operations.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setCreateSchoolMessage(message, type = "") {
  const messageElement = document.querySelector("#create-school-message");
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
 * Sets the loading state for the school creation submit button.
 * @param {boolean} isSubmitting - Whether the request is in flight.
 */
export function setCreateSchoolSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#create-school-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Creating..." : "Create School";
}

/**
 * Renders the confirmation view for a newly created school.
 * @param {object|null} school - The created school object or null.
 */
export function renderCreatedSchoolDetails(school) {
  const resultContainer = document.querySelector("#created-school-result");
  if (!resultContainer) {
    return;
  }

  if (!school || typeof school !== "object") {
    resultContainer.hidden = true;
    resultContainer.innerHTML = "";
    return;
  }

  resultContainer.innerHTML = renderDetailsHtml(school, "Created School Details");
  resultContainer.hidden = false;
}

/**
 * Renders the interactive catalog of university schools.
 * @param {Array<object>} schools - Collection of schools to display.
 */
export function renderSchoolsScreen(schools) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = schools
    .map(
      (school) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(school.name))}</td>
          <td>${escapeHtml(formatFieldValue(school.code))}</td>
          <td>
            <button type="button" class="row-action js-select-school" data-school-id="${escapeHtml(
        formatIdentifier(school.id || school.schoolId)
      )}" ${formatIdentifier(school.id || school.schoolId) ? "" : "disabled"}><i class="fas fa-check"></i> Select</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-list"></i> All Schools</h2>
      <div class="users-search">
        <input type="text" id="school-search-input" class="js-school-search-input" placeholder="Search by name or code">
        <button type="button" class="js-school-search-btn"><i class="fas fa-search"></i> Search</button>
      </div>
      <p class="form-message" id="schools-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-schools-table-body">
            ${rows || '<tr><td colspan="3">No schools found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Renders the archive of soft-deleted schools.
 * @param {Array<object>} schools - Collection of deleted schools.
 */
export function renderDeletedSchoolsScreen(schools) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = schools
    .map(
      (school) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(school.name))}</td>
          <td>${escapeHtml(formatFieldValue(school.code))}</td>
          <td>
            <button type="button" class="row-action js-restore-school" data-school-id="${escapeHtml(
        formatIdentifier(school.id || school.schoolId)
      )}" ${formatIdentifier(school.id || school.schoolId) ? "" : "disabled"}><i class="fas fa-redo"></i> Restore</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-trash"></i> Deleted Schools</h2>
      <p class="form-message" id="schools-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-deleted-schools-table-body">
            ${rows || '<tr><td colspan="3">No deleted schools found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Updates the feedback message for the schools catalog.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setSchoolsMessage(message, type = "") {
  const messageElement = document.querySelector("#schools-message");
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
 * Binds the search trigger for the active schools catalog.
 * @param {Function} onSearch - Callback receiving the search query string.
 */
export function bindSchoolsSearch(onSearch) {
  const searchButton = document.querySelector(".js-school-search-btn");
  const searchInput = document.querySelector(".js-school-search-input");
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
 * Binds the selection of a school from the catalog table.
 * @param {Function} onSchoolSelect - Callback receiving the selected School ID.
 */
export function bindSchoolSelect(onSchoolSelect) {
  const tableBody = document.querySelector(".js-schools-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-school");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const schoolId = button.dataset.schoolId;
    if (!schoolId) {
      return;
    }

    onSchoolSelect(schoolId);
  });
}

/**
 * Binds the restoration action for a soft-deleted school.
 * @param {Function} onRestore - Callback receiving the restored School ID.
 */
export function bindDeletedSchoolRestore(onRestore) {
  const tableBody = document.querySelector(".js-deleted-schools-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-restore-school");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const schoolId = button.dataset.schoolId;
    if (!schoolId) {
      return;
    }

    onRestore(schoolId);
  });
}

/**
 * Opens a modal window for viewing and updating school details.
 * @param {object} school - School data to populate the modal.
 */
export function openSchoolModal(school) {
  closeSchoolModal();

  const recordId = formatIdentifier(school.id || school.schoolId);
  const overlay = document.createElement("div");
  overlay.className = "user-modal-overlay js-school-modal-overlay";
  overlay.innerHTML = `
    <div class="user-modal" data-school-id="${escapeHtml(recordId)}">
      ${renderDetailsHtml(school, "School Details")}
      <h4>Update School</h4>
      <form id="school-update-form" class="user-update-form">
        <label for="modal-school-name">
          <i class="fas fa-school"></i> School Name
          <input type="text" id="modal-school-name" name="name" value="${escapeHtml(
    formatFieldValueForInput(school.name)
  )}" required>
        </label>
        <label for="modal-school-code">
          <i class="fas fa-barcode"></i> School Code
          <input type="text" id="modal-school-code" name="code" value="${escapeHtml(
    formatFieldValueForInput(school.code)
  )}" required>
        </label>
        <p class="form-message" id="school-modal-message" role="status" aria-live="polite"></p>
        <div class="user-modal-actions">
          <button type="submit" class="js-school-modal-submit-btn"><i class="fas fa-save"></i> Submit</button>
          <button type="button" class="js-school-modal-view-programs-btn"><i class="fas fa-book"></i> View School Programs</button>
          <button type="button" class="danger js-school-modal-delete-btn"><i class="fas fa-trash"></i> Delete School</button>
          <button type="button" class="ghost js-school-modal-close-btn"><i class="fas fa-times"></i> Close</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
}

/**
 * Closes close school modal.
 * @returns {void}
 */
export function closeSchoolModal() {
  const overlay = document.querySelector(".js-school-modal-overlay");
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Binds bind school modal actions.
 * @param {object} params
 * @param {*} params.onUpdate
 * @param {*} params.onDelete
 * @param {*} params.onViewPrograms
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindSchoolModalActions({ onUpdate, onDelete, onViewPrograms, onClose }) {
  const overlay = document.querySelector(".js-school-modal-overlay");
  if (!overlay) {
    return;
  }

  const modal = overlay.querySelector(".user-modal");
  const form = overlay.querySelector("#school-update-form");
  const viewProgramsButton = overlay.querySelector(".js-school-modal-view-programs-btn");
  const deleteButton = overlay.querySelector(".js-school-modal-delete-btn");
  const closeButton = overlay.querySelector(".js-school-modal-close-btn");

  if (form && modal && onUpdate) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const schoolId = modal.getAttribute("data-school-id");
      if (!schoolId) {
        return;
      }

      const formData = new FormData(form);
      onUpdate(schoolId, {
        name: (formData.get("name") || "").toString().trim(),
        code: (formData.get("code") || "").toString().trim()
      });
    });
  }

  if (viewProgramsButton instanceof HTMLButtonElement && modal && onViewPrograms) {
    viewProgramsButton.addEventListener("click", () => {
      const schoolId = modal.getAttribute("data-school-id");
      if (!schoolId) {
        return;
      }

      onViewPrograms(schoolId);
    });
  }

  if (deleteButton instanceof HTMLButtonElement && modal && onDelete) {
    deleteButton.addEventListener("click", () => {
      const schoolId = modal.getAttribute("data-school-id");
      if (!schoolId) {
        return;
      }

      onDelete(schoolId);
    });
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => {
      closeSchoolModal();
      if (onClose) {
        onClose();
      }
    });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeSchoolModal();
      if (onClose) {
        onClose();
      }
    }
  });
}

/**
 * Updates the feedback message within the school detail modal.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setSchoolModalMessage(message, type = "") {
  const messageElement = document.querySelector("#school-modal-message");
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
 * Sets the loading state for the school modal's action buttons.
 * @param {boolean} isSubmitting - Whether the request is in flight.
 */
export function setSchoolModalSubmitting(isSubmitting) {
  const submitButton = document.querySelector(".js-school-modal-submit-btn");
  const viewProgramsButton = document.querySelector(".js-school-modal-view-programs-btn");
  const deleteButton = document.querySelector(".js-school-modal-delete-btn");

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Saving..." : "Submit";
  }

  if (viewProgramsButton instanceof HTMLButtonElement) {
    viewProgramsButton.disabled = isSubmitting;
  }

  if (deleteButton instanceof HTMLButtonElement) {
    deleteButton.disabled = isSubmitting;
  }
}

/**
 * Opens a modal displaying all programs associated with a specific school.
 * @param {object} school - Parent school data.
 * @param {Array<object>} [programs=[]] - List of child programs.
 */
export function openSchoolProgramsModal(school, programs = []) {
  closeSchoolModal();

  const schoolId = formatIdentifier(school.id || school.schoolId);
  const rows = programs
    .map(
      (program) => `
      <tr>
        <td>${escapeHtml(formatFieldValue(program.name || program.programName))}</td>
        <td>${escapeHtml(formatFieldValue(program.code || program.programCode))}</td>
        <td>
          <button type="button" class="row-action js-select-school-program"
            data-program-id="${escapeHtml(formatIdentifier(program.id || program.programId))}"
            ${formatIdentifier(program.id || program.programId) ? "" : "disabled"}>Select</button>
        </td>
      </tr>`
    )
    .join("");

  const overlay = document.createElement("div");
  overlay.className = "user-modal-overlay js-school-modal-overlay";
  overlay.innerHTML = `
    <div class="user-modal" data-school-id="${escapeHtml(schoolId)}">
      <h3>${escapeHtml(`Programs - ${formatFieldValue(school.name || school.schoolName)}`)}</h3>
      <p class="form-message" id="school-modal-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-school-programs-table-body">
            ${rows || '<tr><td colspan="3">No programs found for this school.</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="created-user-result js-school-program-details" hidden></div>
      <div class="user-modal-actions">
        <button type="button" class="ghost js-school-modal-back-btn">Back to School Details</button>
        <button type="button" class="ghost js-school-modal-close-btn">Close</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

/**
 * Binds events (Select Program, Back, Close) within the school programs modal.
 * @param {object} handlers - Action callback handlers.
 */
export function bindSchoolProgramsActions({ onProgramSelect, onBack, onClose }) {
  const overlay = document.querySelector(".js-school-modal-overlay");
  if (!overlay) {
    return;
  }

  const tableBody = overlay.querySelector(".js-school-programs-table-body");
  const backButton = overlay.querySelector(".js-school-modal-back-btn");
  const closeButton = overlay.querySelector(".js-school-modal-close-btn");

  if (tableBody && onProgramSelect) {
    tableBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest(".js-select-school-program");
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
      closeSchoolModal();
      if (onClose) {
        onClose();
      }
    });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeSchoolModal();
      if (onClose) {
        onClose();
      }
    }
  });
}

/**
 * Renders the profile details for a selected program within the school context.
 * @param {object} program - Program data.
 */
export function renderSelectedSchoolProgramDetails(program) {
  const detailsContainer = document.querySelector(".js-school-program-details");
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
 * Renders the standardized list of school details based on metadata fields.
 * @param {object} school - School data.
 * @param {string} title - Section header text.
 * @returns {string} HTML string of details.
 */
function renderDetailsHtml(school, title) {
  return `
    <h3>${escapeHtml(title)}</h3>
    <dl class="created-user-grid">
      ${SCHOOL_DETAIL_FIELDS.map(
    ({ label, key }) =>
      `<div class="created-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatFieldValue(school[key]))}</dd></div>`
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
 * Formats a field value specifically for HTML input elements.
 * @param {*} value - Raw value.
 * @returns {string} Formatted string (empty for null/undefined).
 */
function formatFieldValueForInput(value) {
  if (value === null || value === undefined) {
    return "";
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
