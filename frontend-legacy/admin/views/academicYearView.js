/**
 * @fileoverview Presentation layer for Academic Years and Semesters.
 * Manages the UI lifecycle for educational cycle configuration,
 * including activation toggles and creation forms.
 * @module admin/views/academicYearView
 */
export function bindAcademicYearTabTrigger(onRequest) {
  const links = document.querySelectorAll(".js-academic-year-functions");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onRequest();
    });
  });
}

/**
 * Detects interactions with "Semester" sidebar/tab triggers.
 * @param {Function} onRequest - Callback for navigation requests.
 */
export function bindSemesterTabTrigger(onRequest) {
  const links = document.querySelectorAll(".js-semester-functions");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onRequest();
    });
  });
}

/**
 * Orchestrates the full-page render for Academic Year management.
 * @param {object} options - UI state configuration.
 * @param {string} options.selectedFunction - Current active sub-screen (view, create, activate).
 * @param {Array<object>} options.academicYears - Collection of years to display.
 */
export function renderAcademicYearScreen({
  selectedFunction = "view",
  academicYears = []
} = {}) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = academicYears
    .map((year) => {
      const yearId = formatIdentifier(year.academicYearId);
      return `
        <tr>
          <td>${escapeHtml(formatFieldValue(year.name))}</td>
          <td>${escapeHtml(year.active ? "Yes" : "No")}</td>
          <td>
            <button type="button" class="row-action js-activate-academic-year-row"
              data-academic-year-id="${escapeHtml(yearId)}" ${yearId ? "" : "disabled"}>
              Activate
            </button>
          </td>
        </tr>`;
    })
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-calendar\"></i> Academic Year</h2>
      <div class="users-search">
        <label for="academic-year-function-select">
          <i class="fas fa-list\"></i> Function
          <select id="academic-year-function-select" class="js-academic-year-function-select">
            <option value="view" ${selectedFunction === "view" ? "selected" : ""}><i class="fas fa-eye\"></i> View All Academic Years</option>
            <option value="create" ${selectedFunction === "create" ? "selected" : ""}><i class="fas fa-plus-circle\"></i> Create Academic Year</option>
            <option value="activate" ${selectedFunction === "activate" ? "selected" : ""}><i class="fas fa-check-circle\"></i> Activate Academic Year</option>\n          </select>\n        </label>
      </div>
      <p class="form-message" id="academic-year-message" role="status" aria-live="polite"></p>
      <div class="js-academic-year-function-content">
        ${renderAcademicYearFunctionContent(selectedFunction, academicYears, rows)}
      </div>
    </section>`;
}

/**
 * Binds the selection of different sub-functional screens within Academic Year management.
 * @param {Function} onChange - Callback receiving the new function name.
 */
export function bindAcademicYearFunctionChange(onChange) {
  const select = document.querySelector(".js-academic-year-function-select");
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  select.addEventListener("change", () => onChange(select.value));
}

/**
 * Binds the submission event for creating a new academic year.
 * @param {Function} onSubmit - Callback receiving the new academic year name string.
 */
export function bindCreateAcademicYearSubmit(onSubmit) {
  const form = document.querySelector("#create-academic-year-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit((formData.get("name") || "").toString().trim());
  });
}

/**
 * Binds the submission event for activating an administrative educational cycle.
 * @param {Function} onSubmit - Callback receiving the selected academicYearId.
 */
export function bindActivateAcademicYearSubmit(onSubmit) {
  const form = document.querySelector("#activate-academic-year-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit((formData.get("academicYearId") || "").toString().trim());
  });
}

/**
 * Binds delegated click events for "Activate" buttons within the academic years table.
 * @param {Function} onActivate - Callback receiving the academicYearId.
 */
export function bindActivateAcademicYearRow(onActivate) {
  const tableBody = document.querySelector(".js-academic-years-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-activate-academic-year-row");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const academicYearId = button.dataset.academicYearId || "";
    if (academicYearId) {
      onActivate(academicYearId);
    }
  });
}

/**
 * Updates the global success/error feedback message for academic year operations.
 * @param {string} message - Descriptive text.
 * @param {string} [type] - Contextual type ('success' or 'error').
 */
export function setAcademicYearMessage(message, type = "") {
  setMessage("#academic-year-message", message, type);
}

/**
 * Toggles the interactive state of submission buttons during background API tasks.
 * @param {boolean} isSubmitting - Whether an operation is currently in-flight.
 */
export function setAcademicYearSubmitting(isSubmitting) {
  const createButton = document.querySelector("#create-academic-year-form button[type='submit']");
  const activateButton = document.querySelector("#activate-academic-year-form button[type='submit']");

  if (createButton instanceof HTMLButtonElement) {
    createButton.disabled = isSubmitting;
    createButton.textContent = isSubmitting ? "Saving..." : "Create Academic Year";
  }

  if (activateButton instanceof HTMLButtonElement) {
    activateButton.disabled = isSubmitting;
    activateButton.textContent = isSubmitting ? "Activating..." : "Activate Academic Year";
  }
}

/**
 * Orchestrates the full-page render for Semester management.
 * @param {object} options - UI state configuration.
 * @param {string} options.selectedFunction - Active sub-screen (view, create, activate).
 * @param {Array<object>} options.academicYears - Parent years for selection filter.
 * @param {string} options.selectedAcademicYearId - Currently filtered parent ID.
 * @param {Array<object>} options.semesters - List of semesters to display in a table.
 */
export function renderSemesterScreen({
  selectedFunction = "view",
  academicYears = [],
  selectedAcademicYearId = "",
  semesters = []
} = {}) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = semesters
    .map((semester) => {
      const semesterId = formatIdentifier(semester.semesterId);
      return `
        <tr>
          <td>${escapeHtml(formatFieldValue(semester.name))}</td>
          <td>${escapeHtml(formatFieldValue(semester.number))}</td>
          <td>${escapeHtml(semester.active ? "Yes" : "No")}</td>
          <td>
            <button type="button" class="row-action js-activate-semester-row"
              data-semester-id="${escapeHtml(semesterId)}" ${semesterId ? "" : "disabled"}>
              Activate
            </button>
          </td>
        </tr>`;
    })
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2>Semesters</h2>
      <div class="users-search">
        <label for="semester-function-select">
          Function
          <select id="semester-function-select" class="js-semester-function-select">
            <option value="view" ${selectedFunction === "view" ? "selected" : ""}>View Semesters</option>
            <option value="create" ${selectedFunction === "create" ? "selected" : ""}>Create Semester</option>
            <option value="activate" ${selectedFunction === "activate" ? "selected" : ""}>Activate Semester</option>
          </select>
        </label>
        <label for="semester-academic-year-select">
          Academic Year
          <select id="semester-academic-year-select" class="js-semester-academic-year-select">
            ${renderAcademicYearOptions(academicYears, selectedAcademicYearId)}
          </select>
        </label>
      </div>
      <p class="form-message" id="semester-message" role="status" aria-live="polite"></p>
      <div class="js-semester-function-content">
        ${renderSemesterFunctionContent(selectedFunction, semesters, rows)}
      </div>
    </section>`;
}

/**
 * Binds bind semester function change.
 * @param {*} onChange
 * @returns {void}
 */
export function bindSemesterFunctionChange(onChange) {
  const select = document.querySelector(".js-semester-function-select");
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  select.addEventListener("change", () => onChange(select.value));
}

/**
 * Binds bind semester academic year change.
 * @param {*} onChange
 * @returns {void}
 */
export function bindSemesterAcademicYearChange(onChange) {
  const select = document.querySelector(".js-semester-academic-year-select");
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  select.addEventListener("change", () => onChange(select.value));
}

/**
 * Binds bind create semester submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindCreateSemesterSubmit(onSubmit) {
  const form = document.querySelector("#create-semester-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit(Number((formData.get("number") || "0").toString()));
  });
}

/**
 * Binds bind activate semester submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindActivateSemesterSubmit(onSubmit) {
  const form = document.querySelector("#activate-semester-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit((formData.get("semesterId") || "").toString().trim());
  });
}

/**
 * Binds bind activate semester row.
 * @param {*} onActivate
 * @returns {void}
 */
export function bindActivateSemesterRow(onActivate) {
  const tableBody = document.querySelector(".js-semesters-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-activate-semester-row");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const semesterId = button.dataset.semesterId || "";
    if (semesterId) {
      onActivate(semesterId);
    }
  });
}

/**
 * Sets set semester message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setSemesterMessage(message, type = "") {
  setMessage("#semester-message", message, type);
}

/**
 * Sets set semester submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setSemesterSubmitting(isSubmitting) {
  const createButton = document.querySelector("#create-semester-form button[type='submit']");
  const activateButton = document.querySelector("#activate-semester-form button[type='submit']");

  if (createButton instanceof HTMLButtonElement) {
    createButton.disabled = isSubmitting;
    createButton.textContent = isSubmitting ? "Saving..." : "Create Semester";
  }

  if (activateButton instanceof HTMLButtonElement) {
    activateButton.disabled = isSubmitting;
    activateButton.textContent = isSubmitting ? "Activating..." : "Activate Semester";
  }
}

/**
 * Renders render academic year function content.
 * @param {*} selectedFunction
 * @param {Array<*>} academicYears
 * @param {Array<*>} rows
 * @returns {void}
 */
function renderAcademicYearFunctionContent(selectedFunction, academicYears, rows) {
  if (selectedFunction === "create") {
    return `
      <form class="create-user-form" id="create-academic-year-form">
        <label for="academic-year-name">
          Academic Year Name
          <input type="text" id="academic-year-name" name="name" placeholder="2026/2027" required>
        </label>
        <button type="submit">Create Academic Year</button>
      </form>`;
  }

  if (selectedFunction === "activate") {
    return `
      <form class="create-user-form" id="activate-academic-year-form">
        <label for="activate-academic-year-id">
          Academic Year
          <select id="activate-academic-year-id" name="academicYearId" required>
            ${renderAcademicYearOptions(academicYears)}
          </select>
        </label>
        <button type="submit">Activate Academic Year</button>
      </form>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-academic-years-table-body">
            ${rows || '<tr><td colspan="3">No academic years found.</td></tr>'}
          </tbody>
        </table>
      </div>`;
  }

  return `
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody class="js-academic-years-table-body">
          ${rows || '<tr><td colspan="3">No academic years found.</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

/**
 * Renders render semester function content.
 * @param {*} selectedFunction
 * @param {Array<*>} semesters
 * @param {Array<*>} rows
 * @returns {void}
 */
function renderSemesterFunctionContent(selectedFunction, semesters, rows) {
  if (selectedFunction === "create") {
    return `
      <form class="create-user-form" id="create-semester-form">
        <label for="semester-number">
          Semester Number
          <input type="number" id="semester-number" name="number" min="1" max="3" required>
        </label>
        <button type="submit">Create Semester</button>
      </form>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-semesters-table-body">
            ${rows || '<tr><td colspan="4">No semesters found.</td></tr>'}
          </tbody>
        </table>
      </div>`;
  }

  if (selectedFunction === "activate") {
    return `
      <form class="create-user-form" id="activate-semester-form">
        <label for="activate-semester-id">
          Semester
          <select id="activate-semester-id" name="semesterId" required>
            ${renderSemesterOptions(semesters)}
          </select>
        </label>
        <button type="submit">Activate Semester</button>
      </form>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-semesters-table-body">
            ${rows || '<tr><td colspan="4">No semesters found.</td></tr>'}
          </tbody>
        </table>
      </div>`;
  }

  return `
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody class="js-semesters-table-body">
          ${rows || '<tr><td colspan="4">No semesters found.</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

/**
 * Renders render academic year options.
 * @param {Array<*>} academicYears
 * @param {string|number} selectedAcademicYearId
 * @returns {void}
 */
function renderAcademicYearOptions(academicYears, selectedAcademicYearId = "") {
  if (!Array.isArray(academicYears) || academicYears.length === 0) {
    return `<option value="">No academic years available</option>`;
  }

  const options = academicYears
    .map((year) => {
      const id = formatIdentifier(year.academicYearId);
      const name = formatFieldValue(year.name);
      const activityTag = year.active ? " - Active" : " - Inactive";
      const selected = id && String(id) === String(selectedAcademicYearId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name}${activityTag}`)}</option>`;
    })
    .join("");

  return `<option value="">Select Academic Year</option>${options}`;
}

/**
 * Renders render semester options.
 * @param {Array<*>} semesters
 * @returns {void}
 */
function renderSemesterOptions(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return `<option value="">No semesters available</option>`;
  }

  const options = semesters
    .map((semester) => {
      const id = formatIdentifier(semester.semesterId);
      const activityTag = semester.active ? " - Active" : " - Inactive";
      const label = `${formatFieldValue(semester.name)} (No. ${formatFieldValue(semester.number)})${activityTag}`;
      return `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`;
    })
    .join("");

  return `<option value="">Select Semester</option>${options}`;
}

/**
 * Sets set message.
 * @param {*} selector
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
function setMessage(selector, message, type = "") {
  const messageElement = document.querySelector(selector);
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
 * Executes escape html.
 * @param {*} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
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
