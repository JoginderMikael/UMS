/**
 * @fileoverview Frontend module.
 * @module scripts/views/userView
 */
export function showActiveUserName(user) {
  const activeUserEl = document.querySelector(".js-active-user");
  if (!activeUserEl || !user) {
    return;
  }

  activeUserEl.textContent = `${user.firstName} ${user.lastName}`;
}

const CURRENT_USER_BASE_FIELDS = [
  { label: "User ID", key: "id" },
  { label: "First Name", key: "firstName" },
  { label: "Last Name", key: "lastName" },
  { label: "Email", key: "email" },
  { label: "Role", key: "role" }
];

const CURRENT_USER_STUDENT_FIELDS = [
  { label: "Student ID", key: "studentId" },
  { label: "Registration Number", key: "registrationNumber" },
  { label: "School Name", key: "schoolName" },
  { label: "Department Name", key: "departmentName" },
  { label: "Program Name", key: "programName" },
  { label: "National ID", key: "nationalId" },
  { label: "Secondary School", key: "secondarySchool" },
  { label: "Secondary Performance", key: "secondaryPerformance" },
  { label: "Academic Year", key: "academicYearName" },
  { label: "Year Of Study", key: "yearOfStudy" },
  { label: "Semester", key: "semesterName" }
];

/**
 * Binds bind current user profile.
 * @param {*} onOpenProfile
 * @returns {void}
 */
export function bindCurrentUserProfile(onOpenProfile) {
  const activeUserEl = document.querySelector(".js-active-user");
  if (!activeUserEl || !onOpenProfile) {
    return;
  }

  activeUserEl.addEventListener("click", (event) => {
    event.preventDefault();
    onOpenProfile();
  });
}

/**
 * Opens open current user profile modal.
 * @param {object} user
 * @returns {void}
 */
export function openCurrentUserProfileModal(user) {
  closeCurrentUserProfileModal();
  const profileFields = getCurrentUserProfileFields(user);

  const overlay = document.createElement("div");
  overlay.className = "current-user-modal-overlay js-current-user-modal-overlay";
  overlay.innerHTML = `
    <section class="current-user-modal" role="dialog" aria-modal="true" aria-label="My Profile">
      <div class="current-user-modal-header">
        <h3>My Account Details</h3>
        <button type="button" class="ghost js-current-user-modal-close">Close</button>
      </div>
      <dl class="current-user-grid">
        ${profileFields.map(
          ({ label, key }) =>
            `<div class="current-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(
              formatFieldValue(resolveUserProfileValue(user, key))
            )}</dd></div>`
        ).join("")}
      </dl>
    </section>`;

  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector(".js-current-user-modal-close");
  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", closeCurrentUserProfileModal);
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeCurrentUserProfileModal();
    }
  });
}

/**
 * Closes close current user profile modal.
 * @returns {void}
 */
export function closeCurrentUserProfileModal() {
  const existingModal = document.querySelector(".js-current-user-modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }
}

/**
 * Binds bind logout button.
 * @param {*} onLogout
 * @returns {void}
 */
export function bindLogoutButton(onLogout) {
  const logoutButton = document.querySelector(".js-logout-btn");
  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    onLogout();
  });
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
 * Resolves canonical profile values across API payload variants.
 * @param {object} user
 * @param {string} key
 * @returns {*}
 */
function resolveUserProfileValue(user, key) {
  if (!user || typeof user !== "object") {
    return null;
  }

  if (key === "academicYearName") {
    const academicYearLabel =
      user.academicYear && typeof user.academicYear === "object"
        ? user.academicYear.name || user.academicYear.academicYearName
        : user.academicYear;
    return (
      user.activeAcademicYearName ||
      user.academicYearName ||
      academicYearLabel ||
      user.yearName ||
      null
    );
  }

  if (key === "semesterName") {
    const semesterLabel =
      user.semester && typeof user.semester === "object"
        ? user.semester.name || user.semester.semesterName
        : user.semester;
    return user.semesterName || semesterLabel || user.activeSemesterName || null;
  }

  if (key === "departmentName") {
    return user.departmentName || user.department || null;
  }

  return user[key];
}

/**
 * Gets get current user profile fields.
 * @param {object} user
 * @returns {*}
 */
function getCurrentUserProfileFields(user) {
  if (isStudentUser(user)) {
    return [...CURRENT_USER_BASE_FIELDS, ...CURRENT_USER_STUDENT_FIELDS];
  }

  return CURRENT_USER_BASE_FIELDS;
}

/**
 * Checks whether is student user.
 * @param {object} user
 * @returns {boolean}
 */
function isStudentUser(user) {
  if (!user || typeof user !== "object") {
    return false;
  }

  return String(user.role || "").toUpperCase() === "STUDENT";
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


