/**
 * @fileoverview Presentation Layer for Student Enrollments.
 * Manages the UI lifecycle for the admission process, enrollment catalogs,
 * and status tracking (Deferred/Suspended/Active).
 * @module admin/views/enrollmentView
 */
const ENROLLMENT_STATUSES = ["ENROLLED", "DEFERRED", "SUSPENDED", "COMPLETED", "CANCELLED"];

const ENROLLMENT_DETAIL_FIELDS = [
  { label: "Student Name", key: "studentName" },
  { label: "Registration Number", key: "registrationNumber" },
  { label: "Student Email", key: "studentEmail" },
  { label: "Program", key: "program" },
  { label: "School", key: "school" },
  { label: "Enrollment Year", key: "enrollmentYear" },
  { label: "Status", key: "status" },
  { label: "Cancelled At", key: "cancelledAt" },
  { label: "Cancellation Reason", key: "cancellationReason" }
];

/**
 * Binds triggers (sidebar or dashboard buttons) that initiate the "Enroll Student" workflow.
 * @param {Function} onRequest - Initialization callback.
 */
export function bindEnrollStudentTrigger(onRequest) {
  const links = document.querySelectorAll(".js-enroll-student");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onRequest();
    });
  });
}

/**
 * Binds triggers that launch the "Enrollment Details and Search" profile screen.
 * @param {Function} onRequest - Navigation callback.
 */
export function bindEnrollmentDetailsTrigger(onRequest) {
  const links = document.querySelectorAll(".js-enrollment-details");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onRequest();
    });
  });
}

/**
 * Binds sidebar triggers that load the comprehensive student admission/enrollment catalog.
 * @param {Function} onRequest - Navigation callback.
 */
export function bindViewAllEnrollmentsTrigger(onRequest) {
  const links = document.querySelectorAll(".js-view-all-enrollments");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onRequest();
    });
  });
}

/**
 * Renders the student enrollment form in the main dashboard content area.
 * @param {object} options - Initial selections and available data for the form.
 * @param {Array<object>} options.schools - Available schools for the student.
 * @param {Array<object>} options.programs - Available programs (filtered by school if selected).
 * @param {string} options.selectedSchoolId - Currently selected parent school ID.
 */
export function renderEnrollStudentForm({ schools = [], programs = [], selectedSchoolId = "" } = {}) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel create-user-panel">
      <h2><i class="fas fa-clipboard-list"></i> Enroll Student</h2>
      <form class="create-user-form" id="enroll-student-form">
        <label for="enroll-first-name">
          <i class="fas fa-user"></i> First Name
          <input type="text" id="enroll-first-name" name="firstName" required>
        </label>
        <label for="enroll-last-name">
          <i class="fas fa-user"></i> Last Name
          <input type="text" id="enroll-last-name" name="lastName" required>
        </label>
        <label for="enroll-email">
          <i class="fas fa-envelope"></i> Email
          <input type="email" id="enroll-email" name="email" required>
        </label>
        <label for="enroll-national-id">
          <i class="fas fa-id-card"></i> National ID
          <input type="text" id="enroll-national-id" name="nationalId" required>
        </label>
        <label for="enroll-secondary-school">
          <i class="fas fa-school\"></i> Secondary School
          <input type="text" id="enroll-secondary-school" name="secondarySchool" required>
        </label>
        <label for="enroll-secondary-performance">
          <i class="fas fa-chart-bar"></i> Secondary Performance
          <input type="text" id="enroll-secondary-performance" name="secondaryPerformance" required>
        </label>
        <label for="enroll-school-id">
          <i class="fas fa-building"></i> School
          <select id="enroll-school-id" name="schoolId" class="js-enroll-school-select" required>
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="enroll-program-id">
          <i class="fas fa-graduation-cap"></i> Program
          <select id="enroll-program-id" name="programId" class="js-enroll-program-select" required>
            ${renderProgramOptions(programs)}
          </select>
        </label>
        <button type="submit"><i class="fas fa-user-check"></i> Enroll Student</button>
        <p class="form-message" id="enroll-student-message" role="status" aria-live="polite"></p>
      </form>
      <div class="created-user-result" id="enrolled-student-result" hidden></div>
    </section>`;
}

/**
 * Binds the change event for the School dropdown to trigger program list refreshing.
 * @param {Function} onSchoolChange - Callback receiving the new school ID.
 */
export function bindEnrollSchoolChange(onSchoolChange) {
  const schoolSelect = document.querySelector(".js-enroll-school-select");
  if (!(schoolSelect instanceof HTMLSelectElement)) {
    return;
  }

  schoolSelect.addEventListener("change", () => onSchoolChange(schoolSelect.value));
}

/**
 * Programmatically updates the program dropdown options within the enrollment form.
 * @param {Array<object>} programs - New list of programs to display.
 * @param {string} [selectedProgramId] - Program to pre-select.
 */
export function setEnrollProgramOptions(programs, selectedProgramId = "") {
  const programSelect = document.querySelector(".js-enroll-program-select");
  if (!(programSelect instanceof HTMLSelectElement)) {
    return;
  }

  programSelect.innerHTML = renderProgramOptions(programs, selectedProgramId);
}

/**
 * Binds bind enroll student submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindEnrollStudentSubmit(onSubmit) {
  const form = document.querySelector("#enroll-student-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit({
      firstName: (formData.get("firstName") || "").toString().trim(),
      lastName: (formData.get("lastName") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      nationalId: (formData.get("nationalId") || "").toString().trim(),
      secondarySchool: (formData.get("secondarySchool") || "").toString().trim(),
      secondaryPerformance: (formData.get("secondaryPerformance") || "").toString().trim(),
      schoolId: (formData.get("schoolId") || "").toString().trim(),
      programId: (formData.get("programId") || "").toString().trim()
    });
  });
}

/**
 * Sets set enroll student message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setEnrollStudentMessage(message, type = "") {
  setMessage("#enroll-student-message", message, type);
}

/**
 * Sets set enroll student submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setEnrollStudentSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#enroll-student-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Enrolling..." : "Enroll Student";
}

/**
 * Renders render enrolled student result.
 * @param {*} result
 * @returns {void}
 */
export function renderEnrolledStudentResult(result) {
  const container = document.querySelector("#enrolled-student-result");
  if (!container) {
    return;
  }

  if (!result || typeof result !== "object") {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const detailFields = [
    { label: "Student ID", key: "studentId" },
    { label: "Registration Number", key: "registrationNumber" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Temporary Password", key: "temporaryPassword" },
    { label: "Program", key: "program" },
    { label: "School", key: "school" }
  ];

  container.innerHTML = `
    <h3>Enrollment Successful</h3>
    <dl class="created-user-grid">
      ${detailFields
      .map(
        ({ label, key }) =>
          `<div class="created-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(
            formatFieldValue(result[key])
          )}</dd></div>`
      )
      .join("")}
    </dl>`;
  container.hidden = false;
}

/**
 * Renders render enrollments screen.
 * @param {Array<*>} enrollments
 * @param {string} query
 * @param {*} mode
 * @returns {void}
 */
export function renderEnrollmentsScreen(enrollments = [], query = "", mode = "all") {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const title = mode === "details" ? "Enrollment Details" : "All Enrollments";
  const rows = enrollments
    .map((enrollment) => {
      const enrollmentId = formatIdentifier(enrollment.enrollmentId);
      return `
        <tr>
          <td>${escapeHtml(formatFieldValue(enrollment.studentName))}</td>
          <td>${escapeHtml(formatFieldValue(enrollment.registrationNumber))}</td>
          <td>${escapeHtml(formatFieldValue(enrollment.studentEmail))}</td>
          <td>${escapeHtml(formatFieldValue(enrollment.school))}</td>
          <td>${escapeHtml(formatFieldValue(enrollment.program))}</td>
          <td>${escapeHtml(formatFieldValue(enrollment.enrollmentYear))}</td>
          <td>${escapeHtml(formatFieldValue(enrollment.status))}</td>
          <td>
            <button type="button" class="row-action js-select-enrollment"
              data-enrollment-id="${escapeHtml(enrollmentId)}"
              ${enrollmentId ? "" : "disabled"}>Select</button>
          </td>
        </tr>`;
    })
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2>${escapeHtml(title)}</h2>
      <div class="users-search">
        <input type="text" class="js-enrollment-search-input" placeholder="Search by student, reg number, email, school, program, year, or status" value="${escapeHtml(
    query
  )}">
        <button type="button" class="js-enrollment-search-btn">Search</button>
      </div>
      <p class="form-message" id="enrollments-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Reg Number</th>
              <th>Email</th>
              <th>School</th>
              <th>Program</th>
              <th>Year</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-enrollments-table-body">
            ${rows || '<tr><td colspan="8">No enrollments found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Binds bind enrollments search.
 * @param {*} onSearch
 * @returns {void}
 */
export function bindEnrollmentsSearch(onSearch) {
  const searchButton = document.querySelector(".js-enrollment-search-btn");
  const searchInput = document.querySelector(".js-enrollment-search-input");
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
 * Binds bind enrollment select.
 * @param {*} onSelect
 * @returns {void}
 */
export function bindEnrollmentSelect(onSelect) {
  const tableBody = document.querySelector(".js-enrollments-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-enrollment");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const enrollmentId = button.dataset.enrollmentId || "";
    if (enrollmentId) {
      onSelect(enrollmentId);
    }
  });
}

/**
 * Sets set enrollments message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setEnrollmentsMessage(message, type = "") {
  setMessage("#enrollments-message", message, type);
}

/**
 * Renders render enrollment details screen.
 * @param {*} enrollment
 * @param {*} mode
 * @returns {void}
 */
export function renderEnrollmentDetailsScreen(enrollment, mode = "all") {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const enrollmentId = formatIdentifier(enrollment.enrollmentId);
  content.innerHTML = `
    <section class="panel users-panel js-enrollment-details-panel" data-enrollment-id="${escapeHtml(enrollmentId)}">
      <h2><i class="fas fa-search"></i> Enrollment Details</h2>
      <dl class="created-user-grid">
        ${ENROLLMENT_DETAIL_FIELDS.map(
    ({ label, key }) =>
      `<div class="created-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(
        formatFieldValue(enrollment[key])
      )}</dd></div>`
  ).join("")}
      </dl>

      <h3>Update Status</h3>
      <form class="create-user-form" id="update-enrollment-status-form">
        <label for="enrollment-status">
          Status
          <select id="enrollment-status" name="status" required>
            ${renderStatusOptions(enrollment.status)}
          </select>
        </label>
        <button type="submit" class="js-update-enrollment-status-btn">Update Enrollment Status</button>
      </form>

      <h3>Cancel Enrollment</h3>
      <form class="create-user-form" id="cancel-enrollment-form">
        <label for="cancel-reason">
          Reason
          <input type="text" id="cancel-reason" name="reason" placeholder="Enter cancellation reason" required>
        </label>
        <button type="submit" class="danger js-cancel-enrollment-btn">Cancel Enrollment</button>
      </form>

      <div class="user-modal-actions">
        <button type="button" class="ghost js-close-enrollment-details-btn">Close</button>
      </div>
      <p class="form-message" id="enrollment-details-message" role="status" aria-live="polite"></p>
    </section>`;

  const panel = document.querySelector(".js-enrollment-details-panel");
  if (panel) {
    panel.setAttribute("data-return-mode", mode);
  }
}

/**
 * Binds bind enrollment details actions.
 * @param {object} params
 * @param {*} params.onUpdateStatus
 * @param {*} params.onCancelEnrollment
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindEnrollmentDetailsActions({ onUpdateStatus, onCancelEnrollment, onClose }) {
  const panel = document.querySelector(".js-enrollment-details-panel");
  if (!panel) {
    return;
  }

  const statusForm = panel.querySelector("#update-enrollment-status-form");
  const cancelForm = panel.querySelector("#cancel-enrollment-form");
  const closeButton = panel.querySelector(".js-close-enrollment-details-btn");

  if (statusForm && onUpdateStatus) {
    statusForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const enrollmentId = panel.getAttribute("data-enrollment-id") || "";
      const formData = new FormData(statusForm);
      onUpdateStatus(enrollmentId, (formData.get("status") || "").toString().trim());
    });
  }

  if (cancelForm && onCancelEnrollment) {
    cancelForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const enrollmentId = panel.getAttribute("data-enrollment-id") || "";
      const formData = new FormData(cancelForm);
      onCancelEnrollment(enrollmentId, (formData.get("reason") || "").toString().trim());
    });
  }

  if (closeButton instanceof HTMLButtonElement && onClose) {
    closeButton.addEventListener("click", () => {
      const mode = panel.getAttribute("data-return-mode") || "all";
      onClose(mode);
    });
  }
}

/**
 * Sets set enrollment details message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setEnrollmentDetailsMessage(message, type = "") {
  setMessage("#enrollment-details-message", message, type);
}

/**
 * Sets set enrollment details submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setEnrollmentDetailsSubmitting(isSubmitting) {
  const updateButton = document.querySelector(".js-update-enrollment-status-btn");
  const cancelButton = document.querySelector(".js-cancel-enrollment-btn");
  const closeButton = document.querySelector(".js-close-enrollment-details-btn");

  if (updateButton instanceof HTMLButtonElement) {
    updateButton.disabled = isSubmitting;
    updateButton.textContent = isSubmitting ? "Updating..." : "Update Enrollment Status";
  }
  if (cancelButton instanceof HTMLButtonElement) {
    cancelButton.disabled = isSubmitting;
    cancelButton.textContent = isSubmitting ? "Cancelling..." : "Cancel Enrollment";
  }
  if (closeButton instanceof HTMLButtonElement) {
    closeButton.disabled = isSubmitting;
  }
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
 * Renders render program options.
 * @param {Array<*>} programs
 * @param {string|number} selectedProgramId
 * @returns {void}
 */
function renderProgramOptions(programs, selectedProgramId = "") {
  if (!Array.isArray(programs) || programs.length === 0) {
    return `<option value="">No programs available</option>`;
  }

  const options = programs
    .map((program) => {
      const id = formatIdentifier(program.id || program.programId);
      const name = formatFieldValue(program.name || program.programName);
      const code = formatFieldValue(program.code || program.programCode);
      const selected = id && String(id) === String(selectedProgramId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select Program</option>${options}`;
}

/**
 * Renders render status options.
 * @param {Array<*>} selectedStatus
 * @returns {void}
 */
function renderStatusOptions(selectedStatus = "") {
  return ENROLLMENT_STATUSES.map((status) => {
    const selected = String(status) === String(selectedStatus) ? "selected" : "";
    return `<option value="${escapeHtml(status)}" ${selected}>${escapeHtml(status)}</option>`;
  }).join("");
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
