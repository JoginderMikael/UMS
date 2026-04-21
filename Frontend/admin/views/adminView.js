/**
 * Core Administrative Dashboard Presentation Layer.
 * Manages complex UI states for user management, identity lookups,
 * and multi-role (Admin/Faculty/Student) profile editing.
 * @module admin/views/adminView
 */
const USER_BASE_DETAIL_FIELDS = [
  { label: "ID", key: "id" },
  { label: "User ID", key: "userId" },
  { label: "First Name", key: "firstName" },
  { label: "Last Name", key: "lastName" },
  { label: "Email", key: "email" },
  { label: "Role", key: "role" }
];

const USER_STUDENT_DETAIL_FIELDS = [
  { label: "Student ID", key: "studentId" },
  { label: "Registration Number", key: "registrationNumber" },
  { label: "National ID", key: "nationalId" },
  { label: "Secondary School", key: "secondarySchool" },
  { label: "Secondary Performance", key: "secondaryPerformance" },
  { label: "School ID", key: "schoolId" },
  { label: "School Name", key: "schoolName" },
  { label: "Program ID", key: "programId" },
  { label: "Program Name", key: "programName" },
  { label: "Academic Year", key: "academicYear" },
  { label: "Year Of Study", key: "yearOfStudy" },
  { label: "Semester", key: "semester" }
];

/**
 * Initializes the administrative sidebar and responsive navigation menu context.
 * Manages mobile drawer toggles, aria-expanded states, and window resize listeners.
 */
export function initAdminMenuView() {
  const menuButton = document.querySelector(".js-menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const menuBackdrop = document.querySelector(".js-menu-backdrop");
  if (!menuButton || !sidebar || !menuBackdrop) {
    return;
  }

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  sidebar.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("a")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      closeMenu();
    }
  });

  menuBackdrop.addEventListener("click", closeMenu);
}

/**
 * Binds DOM triggers (sidebar links or dashboard buttons) that initiate User Creation.
 * @param {Function} onCreateUserRequest - Callback invoked when the user requests the form.
 */
export function bindCreateUserTriggers(onCreateUserRequest) {
  const createUserLinks = document.querySelectorAll(".js-create-user");
  createUserLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onCreateUserRequest();
    });
  });
}

/**
 * Binds the sidebar/trigger for looking up detailed individual user profiles.
 * @param {Function} onViewUserDetailsRequest - Navigation callback.
 */
export function bindViewUserDetailsTrigger(onViewUserDetailsRequest) {
  const viewUserDetailsLink = document.querySelector(".js-view-user-details");
  if (!viewUserDetailsLink) {
    return;
  }

  viewUserDetailsLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewUserDetailsRequest();
  });
}

/**
 * Binds the sidebar trigger for loading the comprehensive active users catalog.
 * @param {Function} onViewAllUsersRequest - Navigation callback.
 */
export function bindViewAllUsersTrigger(onViewAllUsersRequest) {
  const viewAllUsersLink = document.querySelector(".js-view-all-users");
  if (!viewAllUsersLink) {
    return;
  }

  viewAllUsersLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewAllUsersRequest();
  });
}

/**
 * Binds the sidebar trigger for viewing the archive of soft-deleted user accounts.
 * @param {Function} onViewDeletedUsersRequest - Navigation callback.
 */
export function bindViewDeletedUsersTrigger(onViewDeletedUsersRequest) {
  const viewDeletedUsersLink = document.querySelector(".js-view-deleted-users");
  if (!viewDeletedUsersLink) {
    return;
  }

  viewDeletedUsersLink.addEventListener("click", (event) => {
    event.preventDefault();
    onViewDeletedUsersRequest();
  });
}

/**
 * Renders the primary user registration form on the main dashboard content area.
 */
export function renderCreateUserForm() {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel create-user-panel">
      <h2><i class="fas fa-user-plus"></i> Create User</h2>
      <form class="create-user-form" id="create-user-form">
        <label for="firstName">
          <i class="fas fa-user"></i> First Name
          <input type="text" id="firstName" name="firstName" required>
        </label>
        <label for="lastName">
          <i class="fas fa-user"></i> Last Name
          <input type="text" id="lastName" name="lastName" required>
        </label>
        <label for="email">
          <i class="fas fa-envelope"></i> Email
          <input type="email" id="email" name="email" required>
        </label>
        <label for="password">
          <i class="fas fa-lock"></i> Password
          <input type="password" id="password" name="password" required>
        </label>
        <label for="role">
          <i class="fas fa-shield-alt"></i> Role
          <select id="role" name="role" required>
            <option value="ADMIN">ADMIN</option>
            <option value="FACULTY">FACULTY</option>
          </select>
        </label>
        <button type="submit"><i class="fas fa-plus-circle"></i> Create User</button>
        <p class="form-message" id="create-user-message" role="status" aria-live="polite"></p>
      </form>
      <div class="created-user-result" id="created-user-result" hidden></div>
    </section>`;
}

/**
 * Renders render user lookup screen.
 * @param {*} _mode
 * @returns {void}
 */
export function renderUserLookupScreen(_mode) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const normalizedMode = "details";
  const title = "View User Details";

  content.innerHTML = `
    <section class="panel create-user-panel">
      <h2><i class="fas fa-search"></i> View User Details</h2>
      <form class="create-user-form" id="user-lookup-form" data-mode="${escapeHtml(normalizedMode)}">
        <label for="user-lookup-search-by">
          <i class="fas fa-filter"></i> Search By
          <select id="user-lookup-search-by" name="searchBy" required>
            <option value="id"><i class="fas fa-id-card"></i> User ID</option>
            <option value="email"><i class="fas fa-envelope"></i> Email</option>
          </select>
        </label>
        <label for="user-lookup-query">
          <i class="fas fa-search"></i> Search Value
          <input type="text" id="user-lookup-query" name="query" placeholder="Enter user ID or email" required>
        </label>
        <button type="submit" class="js-user-lookup-submit"><i class="fas fa-magnifying-glass"></i> Search User</button>
        <p class="form-message" id="user-lookup-message" role="status" aria-live="polite"></p>
      </form>
      <div class="created-user-result" id="user-lookup-result" data-mode="${escapeHtml(normalizedMode)}" hidden></div>
    </section>`;
}

/**
 * Binds bind create user submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindCreateUserSubmit(onSubmit) {
  const form = document.querySelector("#create-user-form");
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
      password: (formData.get("password") || "").toString(),
      role: (formData.get("role") || "").toString()
    });
  });
}

/**
 * Sets set create user message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setCreateUserMessage(message, type = "") {
  const messageElement = document.querySelector("#create-user-message");
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
 * Sets set create user submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setCreateUserSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#create-user-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Creating..." : "Create User";
}

/**
 * Sets set user lookup submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setUserLookupSubmitting(isSubmitting) {
  const submitButton = document.querySelector(".js-user-lookup-submit");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Searching..." : "Search User";
}

/**
 * Renders render created user details.
 * @param {object} user
 * @returns {void}
 */
export function renderCreatedUserDetails(user) {
  const resultContainer = document.querySelector("#created-user-result");
  if (!resultContainer) {
    return;
  }

  if (!user || typeof user !== "object") {
    resultContainer.hidden = true;
    resultContainer.innerHTML = "";
    return;
  }

  resultContainer.innerHTML = renderDetailsHtml(user, "Created User Details");
  resultContainer.hidden = false;
}

/**
 * Renders render user lookup result.
 * @param {object} user
 * @param {*} _mode
 * @returns {void}
 */
export function renderUserLookupResult(user, _mode) {
  const resultContainer = document.querySelector("#user-lookup-result");
  if (!resultContainer) {
    return;
  }

  if (!user || typeof user !== "object") {
    resultContainer.hidden = true;
    resultContainer.innerHTML = "";
    return;
  }

  const normalizedMode = "details";
  const actionId = formatIdentifier(user.id || user.userId);

  resultContainer.innerHTML = `
    ${renderDetailsHtml(user, "User Details")}
    <div class="user-modal-actions">
      <button type="button" class="js-user-lookup-action"
        data-user-id="${escapeHtml(actionId)}"
        data-action="update"
        ${actionId ? "" : "disabled"}>Update User Details</button>
      <button type="button" class="danger js-user-lookup-action"
        data-user-id="${escapeHtml(actionId)}"
        data-action="delete"
        ${actionId ? "" : "disabled"}>Delete User</button>
    </div>`;
  resultContainer.hidden = false;
}

/**
 * Binds bind user lookup submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindUserLookupSubmit(onSubmit) {
  const form = document.querySelector("#user-lookup-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const mode = (form.getAttribute("data-mode") || "details").toString();
    onSubmit({
      searchBy: (formData.get("searchBy") || "").toString(),
      query: (formData.get("query") || "").toString().trim(),
      mode
    });
  });
}

/**
 * Binds bind user lookup action.
 * @param {*} onAction
 * @returns {void}
 */
export function bindUserLookupAction(onAction) {
  const container = document.querySelector("#user-lookup-result");
  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-user-lookup-action");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const userId = button.dataset.userId;
    const action = button.dataset.action || "update";
    if (!userId) {
      return;
    }

    onAction(userId, action);
  });
}

/**
 * Sets set user lookup message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setUserLookupMessage(message, type = "") {
  const messageElement = document.querySelector("#user-lookup-message");
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
 * Renders render users screen.
 * @param {Array<*>} users
 * @returns {void}
 */
export function renderUsersScreen(users) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = users
    .map(
      (user) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(user.firstName))}</td>
          <td>${escapeHtml(formatFieldValue(user.lastName))}</td>
          <td>${escapeHtml(formatFieldValue(user.email))}</td>
          <td>${escapeHtml(formatFieldValue(user.role))}</td>
          <td>
            <button type="button" class="row-action js-select-user" data-user-id="${escapeHtml(
        formatIdentifier(user.id)
      )}" ${formatIdentifier(user.id) ? "" : "disabled"}>Select</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-list"></i> All Users</h2>
      <div class="users-search">
        <input type="text" id="user-search-input" class="js-user-search-input" placeholder="Search by name or email">
        <button type="button" class="js-user-search-btn">Search</button>
      </div>
      <p class="form-message" id="users-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-users-table-body">
            ${rows || '<tr><td colspan="5">No users found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Renders render deleted users screen.
 * @param {Array<*>} users
 * @returns {void}
 */
export function renderDeletedUsersScreen(users) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = users
    .map(
      (user) => `
        <tr>
          <td>${escapeHtml(formatFieldValue(user.firstName))}</td>
          <td>${escapeHtml(formatFieldValue(user.lastName))}</td>
          <td>${escapeHtml(formatFieldValue(user.email))}</td>
          <td>${escapeHtml(formatFieldValue(user.role))}</td>
          <td>
            <button type="button" class="row-action js-select-deleted-user" data-user-id="${escapeHtml(
        formatIdentifier(user.id)
      )}" ${formatIdentifier(user.id) ? "" : "disabled"}>Select</button>
          </td>
        </tr>`
    )
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-trash"></i> Deleted Users</h2>
      <p class="form-message" id="users-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-deleted-users-table-body">
            ${rows || '<tr><td colspan="5">No deleted users found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Sets set users message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setUsersMessage(message, type = "") {
  const messageElement = document.querySelector("#users-message");
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
 * Binds bind users search.
 * @param {*} onSearch
 * @returns {void}
 */
export function bindUsersSearch(onSearch) {
  const searchButton = document.querySelector(".js-user-search-btn");
  const searchInput = document.querySelector(".js-user-search-input");
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
 * Binds bind user select.
 * @param {object} onUserSelect
 * @returns {void}
 */
export function bindUserSelect(onUserSelect) {
  const tableBody = document.querySelector(".js-users-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-user");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const userId = button.dataset.userId;
    if (!userId) {
      return;
    }

    onUserSelect(userId);
  });
}

/**
 * Binds bind deleted user select.
 * @param {object} onUserSelect
 * @returns {void}
 */
export function bindDeletedUserSelect(onUserSelect) {
  const tableBody = document.querySelector(".js-deleted-users-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-deleted-user");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const userId = button.dataset.userId;
    if (!userId) {
      return;
    }

    onUserSelect(userId);
  });
}

/**
 * Opens open user modal.
 * @param {object} params
 * @param {*} params.user
 * @param {*} params.mode
 * @param {*} params.schools
 * @param {*} params.programs
 * @returns {void}
 */
export function openUserModal({ user, mode, schools = [], programs = [] }) {
  const existingModal = document.querySelector(".js-user-modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }

  const safeRecordId = escapeHtml(formatIdentifier(user.recordId || user.id || user.userId));
  const safeUpdateId = escapeHtml(formatIdentifier(user.updateId || user.studentId));
  const safeDeleteId = escapeHtml(formatIdentifier(user.deleteId || user.userId || user.id));
  const overlay = document.createElement("div");
  overlay.className = "user-modal-overlay js-user-modal-overlay";
  overlay.innerHTML = `
    <div
      class="user-modal"
      data-record-id="${safeRecordId}"
      data-update-id="${safeUpdateId}"
      data-delete-id="${safeDeleteId}"
      data-update-mode="${escapeHtml(mode)}"
    >
      ${renderDetailsHtml(user, "User Details")}
      <h4>${mode === "student" ? "Edit Student" : "Edit User"}</h4>
      ${mode === "student"
      ? renderStudentEditForm(user, schools, programs)
      : renderStandardEditForm(user)
    }
    </div>`;

  document.body.appendChild(overlay);
}

/**
 * Closes close user modal.
 * @returns {void}
 */
export function closeUserModal() {
  const overlay = document.querySelector(".js-user-modal-overlay");
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Opens open deleted user modal.
 * @param {object} user
 * @returns {void}
 */
export function openDeletedUserModal(user) {
  closeUserModal();
  const restoreId = escapeHtml(formatIdentifier(user.id || user.userId));
  const overlay = document.createElement("div");
  overlay.className = "user-modal-overlay js-user-modal-overlay";
  overlay.innerHTML = `
    <div class="user-modal" data-restore-id="${restoreId}">
      ${renderDetailsHtml(user, "Deleted User Details")}
      <p class="form-message" id="user-modal-message" role="status" aria-live="polite"></p>
      <div class="user-modal-actions">
        <button type="button" class="js-modal-restore-btn">Restore User</button>
        <button type="button" class="ghost js-modal-close-btn">Close</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

/**
 * Binds bind user modal actions.
 * @param {object} params
 * @param {*} params.onUpdate
 * @param {*} params.onDelete
 * @param {*} params.onClose
 * @param {*} params.onSchoolChange
 * @returns {void}
 */
export function bindUserModalActions({ onUpdate, onDelete, onClose, onSchoolChange }) {
  const overlay = document.querySelector(".js-user-modal-overlay");
  if (!overlay) {
    return;
  }

  const modal = overlay.querySelector(".user-modal");
  const form = overlay.querySelector("#user-update-form");
  const deleteButton = overlay.querySelector(".js-modal-delete-btn");
  const closeButton = overlay.querySelector(".js-modal-close-btn");
  const schoolSelect = overlay.querySelector(".js-student-school-select");

  if (form && modal) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const recordId = modal.getAttribute("data-record-id");
      const mode = modal.getAttribute("data-update-mode") || "user";
      if (!recordId) {
        return;
      }

      const formData = new FormData(form);
      if (mode === "student") {
        const updateId = modal.getAttribute("data-update-id");
        if (!updateId) {
          return;
        }

        onUpdate(recordId, mode, {
          firstName: (formData.get("firstName") || "").toString().trim(),
          lastName: (formData.get("lastName") || "").toString().trim(),
          email: (formData.get("email") || "").toString().trim(),
          nationalId: (formData.get("nationalId") || "").toString().trim(),
          secondarySchool: (formData.get("secondarySchool") || "").toString().trim(),
          secondaryPerformance: (formData.get("secondaryPerformance") || "").toString().trim(),
          schoolId: (formData.get("schoolId") || "").toString().trim(),
          programId: (formData.get("programId") || "").toString().trim()
        }, updateId);
        return;
      }

      const updateId = modal.getAttribute("data-update-id") || recordId;
      onUpdate(recordId, mode, {
        firstName: (formData.get("firstName") || "").toString().trim(),
        lastName: (formData.get("lastName") || "").toString().trim(),
        email: (formData.get("email") || "").toString().trim(),
        role: (formData.get("role") || "").toString()
      }, updateId);
    });
  }

  if (schoolSelect && onSchoolChange && modal) {
    schoolSelect.addEventListener("change", () => {
      const recordId = modal.getAttribute("data-record-id");
      if (!recordId) {
        return;
      }

      onSchoolChange(recordId, schoolSelect.value);
    });
  }

  if (deleteButton && modal) {
    deleteButton.addEventListener("click", () => {
      const deleteId = modal.getAttribute("data-delete-id");
      if (!deleteId) {
        return;
      }

      onDelete(deleteId);
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeUserModal();
      if (onClose) {
        onClose();
      }
    });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeUserModal();
      if (onClose) {
        onClose();
      }
    }
  });
}

/**
 * Binds bind deleted user modal actions.
 * @param {object} params
 * @param {*} params.onRestore
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindDeletedUserModalActions({ onRestore, onClose }) {
  const overlay = document.querySelector(".js-user-modal-overlay");
  if (!overlay) {
    return;
  }

  const modal = overlay.querySelector(".user-modal");
  const restoreButton = overlay.querySelector(".js-modal-restore-btn");
  const closeButton = overlay.querySelector(".js-modal-close-btn");

  if (restoreButton instanceof HTMLButtonElement && modal && onRestore) {
    restoreButton.addEventListener("click", () => {
      const restoreId = modal.getAttribute("data-restore-id");
      if (!restoreId) {
        return;
      }

      onRestore(restoreId);
    });
  }

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => {
      closeUserModal();
      if (onClose) {
        onClose();
      }
    });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeUserModal();
      if (onClose) {
        onClose();
      }
    }
  });
}

/**
 * Sets set user modal message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setUserModalMessage(message, type = "") {
  const messageElement = document.querySelector("#user-modal-message");
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
 * Sets set user modal submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setUserModalSubmitting(isSubmitting) {
  const updateButton = document.querySelector(".js-modal-update-btn");
  const deleteButton = document.querySelector(".js-modal-delete-btn");
  const restoreButton = document.querySelector(".js-modal-restore-btn");

  if (updateButton instanceof HTMLButtonElement) {
    updateButton.disabled = isSubmitting;
    updateButton.textContent = isSubmitting ? "Saving..." : "Save Changes";
  }

  if (deleteButton instanceof HTMLButtonElement) {
    deleteButton.disabled = isSubmitting;
  }

  if (restoreButton instanceof HTMLButtonElement) {
    restoreButton.disabled = isSubmitting;
    restoreButton.textContent = isSubmitting ? "Restoring..." : "Restore User";
  }
}

/**
 * Sets set student program options.
 * @param {Array<*>} programs
 * @param {string|number} selectedProgramId
 * @returns {void}
 */
export function setStudentProgramOptions(programs, selectedProgramId = "") {
  const programSelect = document.querySelector(".js-student-program-select");
  if (!(programSelect instanceof HTMLSelectElement)) {
    return;
  }

  programSelect.innerHTML = renderProgramOptions(programs, selectedProgramId);
}

/**
 * Renders render details html.
 * @param {object} user
 * @param {*} title
 * @returns {void}
 */
function renderDetailsHtml(user, title) {
  const detailFields = getUserDetailFields(user);
  return `
    <h3>${escapeHtml(title)}</h3>
    <dl class="created-user-grid user-modal-details">
      ${detailFields.map(
    ({ label, key }) =>
      `<div class="created-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatFieldValue(user[key]))}</dd></div>`
  ).join("")}
    </dl>`;
}

/**
 * Gets get user detail fields.
 * @param {object} user
 * @returns {*}
 */
function getUserDetailFields(user) {
  if (isStudentUser(user)) {
    return [...USER_BASE_DETAIL_FIELDS, ...USER_STUDENT_DETAIL_FIELDS];
  }

  return USER_BASE_DETAIL_FIELDS;
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
 * Renders render standard edit form.
 * @param {object} user
 * @returns {void}
 */
function renderStandardEditForm(user) {
  return `
    <form id="user-update-form" class="user-update-form">
      <label for="modal-firstName">
        First Name
        <input type="text" id="modal-firstName" name="firstName" value="${escapeHtml(
    formatFieldValueForInput(user.firstName)
  )}" required>
      </label>
      <label for="modal-lastName">
        Last Name
        <input type="text" id="modal-lastName" name="lastName" value="${escapeHtml(
    formatFieldValueForInput(user.lastName)
  )}" required>
      </label>
      <label for="modal-email">
        Email
        <input type="email" id="modal-email" name="email" value="${escapeHtml(
    formatFieldValueForInput(user.email)
  )}" required>
      </label>
      <label for="modal-role">
        Role
        <select id="modal-role" name="role" required>
          <option value="STUDENT" ${user.role === "STUDENT" ? "selected" : ""}>STUDENT</option>
          <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
          <option value="FACULTY" ${user.role === "FACULTY" ? "selected" : ""}>FACULTY</option>
          
        </select>
      </label>
      <p class="form-message" id="user-modal-message" role="status" aria-live="polite"></p>
      <div class="user-modal-actions">
        <button type="submit" class="js-modal-update-btn">Save Changes</button>
        <button type="button" class="danger js-modal-delete-btn">Delete User</button>
        <button type="button" class="ghost js-modal-close-btn">Close</button>
      </div>
    </form>`;
}

/**
 * Renders render student edit form.
 * @param {object} user
 * @param {Array<*>} schools
 * @param {Array<*>} programs
 * @returns {void}
 */
function renderStudentEditForm(user, schools, programs) {
  return `
    <form id="user-update-form" class="user-update-form">
      <label for="modal-firstName">
        First Name
        <input type="text" id="modal-firstName" name="firstName" value="${escapeHtml(
    formatFieldValueForInput(user.firstName)
  )}" required>
      </label>
      <label for="modal-lastName">
        Last Name
        <input type="text" id="modal-lastName" name="lastName" value="${escapeHtml(
    formatFieldValueForInput(user.lastName)
  )}" required>
      </label>
      <label for="modal-email">
        Email
        <input type="email" id="modal-email" name="email" value="${escapeHtml(
    formatFieldValueForInput(user.email)
  )}" required>
      </label>
      <label for="modal-national-id">
        National ID
        <input type="text" id="modal-national-id" name="nationalId" value="${escapeHtml(
    formatFieldValueForInput(user.nationalId)
  )}" required>
      </label>
      <label for="modal-secondary-school">
        Secondary School
        <input type="text" id="modal-secondary-school" name="secondarySchool" value="${escapeHtml(
    formatFieldValueForInput(user.secondarySchool)
  )}" required>
      </label>
      <label for="modal-secondary-performance">
        Secondary Performance
        <input type="text" id="modal-secondary-performance" name="secondaryPerformance" value="${escapeHtml(
    formatFieldValueForInput(user.secondaryPerformance)
  )}" required>
      </label>
      <label for="modal-school-id">
        School
        <select id="modal-school-id" name="schoolId" class="js-student-school-select" required>
          ${renderSchoolOptions(schools, user.schoolId)}
        </select>
      </label>
      <label for="modal-program-id">
        Program
        <select id="modal-program-id" name="programId" class="js-student-program-select" required>
          ${renderProgramOptions(programs, user.programId)}
        </select>
      </label>
      <p class="form-message" id="user-modal-message" role="status" aria-live="polite"></p>
      <div class="user-modal-actions">
        <button type="submit" class="js-modal-update-btn">Save Changes</button>
        <button type="button" class="danger js-modal-delete-btn">Delete User</button>
        <button type="button" class="ghost js-modal-close-btn">Close</button>
      </div>
    </form>`;
}

/**
 * Renders render school options.
 * @param {Array<*>} schools
 * @param {string|number} selectedSchoolId
 * @returns {void}
 */
function renderSchoolOptions(schools, selectedSchoolId) {
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
function renderProgramOptions(programs, selectedProgramId) {
  if (!Array.isArray(programs) || programs.length === 0) {
    return `<option value="">No programs available</option>`;
  }

  const options = programs
    .map((program) => {
      const id = formatIdentifier(program.id || program.programId);
      const name = formatFieldValue(program.name || program.programName);
      const code = formatFieldValue(program.code || program.programCode || program.departmentCode);
      const selected = id && String(id) === String(selectedProgramId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select Program</option>${options}`;
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
