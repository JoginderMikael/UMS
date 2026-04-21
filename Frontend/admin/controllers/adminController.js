/**
 * @fileoverview Main administrative controller for user and system management.
 * Coordinates user creation, profile updates, account restoration, and lookup across
 * generic users and specialized student roles.
 * @module admin/controllers/adminController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import {
  fetchUserByEmail,
  fetchUserById,
  createUser,
  deleteUser,
  fetchAllDeletedUsers,
  fetchAllSchools,
  fetchAllUsers,
  fetchProgramsBySchool,
  restoreDeletedUser,
  updateStudentUser,
  updateUser
} from "../models/userModel.js";
import {
  bindDeletedUserModalActions,
  bindDeletedUserSelect,
  bindCreateUserSubmit,
  bindCreateUserTriggers,
  bindViewUserDetailsTrigger,
  bindUserModalActions,
  bindUserLookupAction,
  bindUserLookupSubmit,
  bindViewDeletedUsersTrigger,
  bindUsersSearch,
  bindUserSelect,
  bindViewAllUsersTrigger,
  closeUserModal,
  initAdminMenuView,
  openDeletedUserModal,
  openUserModal,
  renderCreateUserForm,
  renderCreatedUserDetails,
  renderDeletedUsersScreen,
  renderUserLookupResult,
  renderUserLookupScreen,
  renderUsersScreen,
  setCreateUserMessage,
  setCreateUserSubmitting,
  setStudentProgramOptions,
  setUserLookupMessage,
  setUserLookupSubmitting,
  setUserModalMessage,
  setUserModalSubmitting,
  setUsersMessage
} from "../views/adminView.js";

let allUsers = [];
let deletedUsers = [];
let lookedUpUser = null;
let schoolsCache = [];
const programsCacheBySchoolId = new Map();

/**
 * Initializes the administrative controller by setting up the navigation menu.
 * Binds core triggers for user creation, list viewing, and specialized lookups.
 * @returns {void} No return value.
 */
export function initAdminController() {
  initAdminMenuView();
  bindCreateUserTriggers(handleCreateUserRequested);
  bindViewUserDetailsTrigger(handleViewUserDetailsRequested);
  bindViewAllUsersTrigger(handleViewAllUsersRequested);
  bindViewDeletedUsersTrigger(handleViewDeletedUsersRequested);
}

/**
 * Orchestrates the UI transition to the 'Create User' workflow.
 * Resets form states and binds the submission handler.
 * @returns {void} No return value.
 */
function handleCreateUserRequested() {
  renderCreateUserForm();
  renderCreatedUserDetails(null);
  setCreateUserMessage("");
  bindCreateUserSubmit(handleCreateUserSubmit);
}

/**
 * Processes the submission of the user creation form.
 * Transmits the payload to the server and handles the resulting success or failure.
 * @param {object} payload - The structured data representing the new user (name, email, role, etc.).
 * @returns {Promise<void>} Resolves when the creation process and UI update are complete.
 */
async function handleCreateUserSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setCreateUserMessage("Session expired. Please log in again.", "error");
    return;
  }

  setCreateUserSubmitting(true);
  setCreateUserMessage("");

  try {
    const createdUser = await createUser(payload, token);
    setCreateUserMessage("User created successfully.", "success");
    renderCreatedUserDetails(createdUser);
  } catch (error) {
    setCreateUserMessage(error.message || "Failed to create user.", "error");
    renderCreatedUserDetails(null);
    console.error("Create user failed:", error);
  } finally {
    setCreateUserSubmitting(false);
  }
}

/**
 * Navigates the administrator to the User Lookup / Details view.
 * Prepares the screen for searching by email or ID.
 * @returns {void} No return value.
 */
function handleViewUserDetailsRequested() {
  lookedUpUser = null;
  renderUserLookupScreen("details");
  setUserLookupMessage("");
  renderUserLookupResult(null, "details");
  bindUserLookupSubmit(handleUserLookupSubmit);
  bindUserLookupAction(handleUserLookupAction);
}

/**
 * Retrieves and displays an exhaustive list of all active users in the system.
 * Handles loading states and session timeouts during the fetch operation.
 * @returns {Promise<void>} Resolves when the user list is rendered.
 */
async function handleViewAllUsersRequested() {
  const token = loadToken();
  if (!token) {
    renderUsersScreen([]);
    setUsersMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderUsersScreen([]);
  setUsersMessage("Loading users...");

  try {
    const responseData = await fetchAllUsers(token);
    allUsers = normalizeCollection(responseData);
    renderUsersScreen(allUsers);
    setUsersMessage(`Loaded ${allUsers.length} user(s).`, "success");
    bindUsersEvents();
  } catch (error) {
    renderUsersScreen([]);
    setUsersMessage(error.message || "Failed to load users.", "error");
    console.error("Fetch all users failed:", error);
  }
}

/**
 * Fetches and displays records of users who have been soft-deleted from the system.
 * Allows administrators to access the restoration workflow.
 * @returns {Promise<void>} Resolves when the deleted users table is updated.
 */
async function handleViewDeletedUsersRequested() {
  const token = loadToken();
  if (!token) {
    renderDeletedUsersScreen([]);
    setUsersMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderDeletedUsersScreen([]);
  setUsersMessage("Loading deleted users...");

  try {
    const responseData = await fetchAllDeletedUsers(token);
    deletedUsers = normalizeCollection(responseData);
    renderDeletedUsersScreen(deletedUsers);
    setUsersMessage(`Loaded ${deletedUsers.length} deleted user(s).`, "success");
    bindDeletedUsersEvents();
  } catch (error) {
    renderDeletedUsersScreen([]);
    setUsersMessage(error.message || "Failed to load deleted users.", "error");
    console.error("Fetch deleted users failed:", error);
  }
}

/**
 * Executes a targeted search for a single user by their email or unique identifier.
 * Automatically normalizes the resulting payload for high-fidelity rendering.
 * @param {object} params - Search configuration.
 * @param {string} params.searchBy - The field to search by ('email' or 'id').
 * @param {string} params.query - The search term.
 * @param {string} params.mode - The UI context ('details' or 'update') for the result.
 * @returns {Promise<void>} Resolves when the lookup result is displayed.
 */
async function handleUserLookupSubmit({ searchBy, query, mode }) {
  const token = loadToken();
  if (!token) {
    setUserLookupMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!query) {
    setUserLookupMessage("Enter a search value.", "error");
    return;
  }

  setUserLookupSubmitting(true);
  setUserLookupMessage("");
  renderUserLookupResult(null, mode);

  try {
    const user =
      searchBy === "email"
        ? await fetchUserByEmail(query, token)
        : await fetchUserById(query, token);

    lookedUpUser = normalizeCollection(user)[0] || (user && typeof user === "object" ? user : null);
    if (!lookedUpUser) {
      setUserLookupMessage("User not found.", "error");
      return;
    }

    renderUserLookupResult(lookedUpUser, mode);
    setUserLookupMessage("User found.", "success");
  } catch (error) {
    lookedUpUser = null;
    renderUserLookupResult(null, mode);
    setUserLookupMessage(error.message || "Failed to find user.", "error");
    console.error("User lookup failed:", error);
  } finally {
    setUserLookupSubmitting(false);
  }
}

/**
 * Handles secondary actions (like update or delete) initiated from the User Lookup screen.
 * @param {string|number} userId - The unique identifier of the user to act upon.
 * @param {string} action - The action type (e.g., 'delete', 'update').
 * @returns {Promise<void>} Resolves once the action and resulting navigation are finished.
 */
async function handleUserLookupAction(userId, action) {
  if (!lookedUpUser || String(lookedUpUser.id || lookedUpUser.userId) !== String(userId)) {
    setUserLookupMessage("Selected user was not found in the current lookup result.", "error");
    return;
  }

  if (action === "delete") {
    await handleUserDelete(userId, { preserveLookupView: true });
    lookedUpUser = null;
    renderUserLookupResult(null, "details");
    return;
  }

  try {
    await openSelectedUserModal(lookedUpUser, lookedUpUser);
  } catch (error) {
    setUserLookupMessage(error.message || "Failed to open update form.", "error");
    console.error("Open update modal from lookup failed:", error);
  }
}

/**
 * Established listeners for generic user list interactions like inline search and selection.
 * @returns {void} No return value.
 */
function bindUsersEvents() {
  bindUsersSearch(handleUsersSearch);
  bindUserSelect(handleUserSelected);
}

/**
 * Binds bind deleted users events.
 * @returns {void}
 */
function bindDeletedUsersEvents() {
  bindDeletedUserSelect(handleDeletedUserSelected);
}

/**
 * Performs client-side filtering on the active user list based on a keywords search.
 * Searches across name, ID, and email addresses.
 * @param {string} query - The search string.
 * @returns {void} Updates the UI with the filtered results.
 */
function handleUsersSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    renderUsersScreen(allUsers);
    setUsersMessage(`Loaded ${allUsers.length} user(s).`, "success");
    bindUsersEvents();
    return;
  }

  const filteredUsers = allUsers.filter((user) => {
    const idMatch = String(user.id || "")
      .toLowerCase()
      .includes(normalizedQuery);
    const firstNameMatch = String(user.firstName || "")
      .toLowerCase()
      .includes(normalizedQuery);
    const lastNameMatch = String(user.lastName || "")
      .toLowerCase()
      .includes(normalizedQuery);
    const emailMatch = String(user.email || "")
      .toLowerCase()
      .includes(normalizedQuery);

    return idMatch || firstNameMatch || lastNameMatch || emailMatch;
  });

  renderUsersScreen(filteredUsers);
  setUsersMessage(`Search returned ${filteredUsers.length} user(s).`, "success");
  bindUsersEvents();
}

/**
 * Responds to a user selection from a list, triggering the detailed profile modal.
 * @param {string|number} userId - The ID of the clicked user record.
 * @returns {Promise<void>} Resolves when the modal appears.
 */
async function handleUserSelected(userId) {
  const selectedUser = allUsers.find((item) => String(item.id) === String(userId));
  if (!selectedUser) {
    setUsersMessage("Selected user was not found in the loaded results.", "error");
    return;
  }

  try {
    await openSelectedUserModal(selectedUser, selectedUser);
  } catch (error) {
    setUsersMessage(error.message || "Failed to open user details.", "error");
    console.error("Open user modal failed:", error);
  }
}

/**
 * Handles handle deleted user selected.
 * @param {string|number} userId
 * @returns {void}
 */
function handleDeletedUserSelected(userId) {
  const selectedUser = deletedUsers.find((item) => String(item.id) === String(userId));
  if (!selectedUser) {
    setUsersMessage("Selected deleted user was not found.", "error");
    return;
  }

  openDeletedUserModal(selectedUser);
  bindDeletedUserModalActions({
    onRestore: handleDeletedUserRestore
  });
}

/**
 * Prepares and displays the appropriate edit/view modal Based on the user's role.
 * Specialized Student users receive an enhanced configuration interface.
 * @param {object} baseUser - The core user identity data.
 * @param {object} detailsUser - The expanded profile data (may contain role-specific fields).
 * @returns {Promise<void>} Resolves once the modal is injected into the DOM.
 */
async function openSelectedUserModal(baseUser, detailsUser) {
  const role = (detailsUser.role || baseUser.role || "").toString().toUpperCase();
  const mode = role === "STUDENT" ? "student" : "user";
  if (mode === "student") {
    await openStudentModal(baseUser, detailsUser);
    return;
  }

  const modalUser = {
    ...baseUser,
    ...detailsUser,
    id: baseUser.id,
    userId: detailsUser.userId || baseUser.id,
    recordId: baseUser.id,
    updateId: baseUser.id,
    deleteId: detailsUser.userId || baseUser.id
  };

  openUserModal({
    user: modalUser,
    mode: "user"
  });

  bindUserModalActions({
    onUpdate: handleUserUpdate,
    onDelete: handleUserDelete
  });
}

/**
 * Opens open student modal.
 * @param {object} baseUser
 * @param {object} detailsUser
 * @returns {Promise<*>}
 */
async function openStudentModal(baseUser, detailsUser) {
  const token = loadToken();
  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  const schools = await ensureSchools(token);
  const schoolId = detailsUser.schoolId || baseUser.schoolId || "";
  const programs = schoolId ? await ensureProgramsBySchool(schoolId, token) : [];
  const studentUpdateId = resolveStudentId(detailsUser, baseUser);

  const modalUser = {
    ...baseUser,
    ...detailsUser,
    id: baseUser.id,
    userId: detailsUser.userId || baseUser.id,
    studentId: studentUpdateId,
    recordId: baseUser.id,
    updateId: studentUpdateId,
    deleteId: detailsUser.userId || baseUser.id,
    role: "STUDENT"
  };

  openUserModal({
    user: modalUser,
    mode: "student",
    schools,
    programs
  });

  bindUserModalActions({
    onUpdate: handleUserUpdate,
    onDelete: handleUserDelete,
    onSchoolChange: handleStudentSchoolChange
  });
}

/**
 * Handles handle student school change.
 * @param {string|number} _userId
 * @param {string|number} schoolId
 * @returns {Promise<*>}
 */
async function handleStudentSchoolChange(_userId, schoolId) {
  const token = loadToken();
  if (!token) {
    setUserModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!schoolId) {
    setStudentProgramOptions([]);
    return;
  }

  setUserModalMessage("Loading programs...");

  try {
    const programs = await ensureProgramsBySchool(schoolId, token);
    setStudentProgramOptions(programs);
    setUserModalMessage("");
  } catch (error) {
    setStudentProgramOptions([]);
    setUserModalMessage(error.message || "Failed to load programs.", "error");
  }
}

/**
 * Validates and transmits a user profile update to the server.
 * Handles logic for merging local state with the server's confirmation response.
 * @param {string|number} recordId - The lookup ID of the record in the current list.
 * @param {string} mode - The operation mode ('student' or 'user').
 * @param {object} payload - The new field values provided by the administrator.
 * @param {string|number} [updateTargetId=recordId] - The specific API target (different for students).
 * @returns {Promise<void>} Resolves when state is synced and modal feedback is shown.
 */
async function handleUserUpdate(recordId, mode, payload, updateTargetId = recordId) {
  const token = loadToken();
  if (!token) {
    setUserModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (mode === "student" && (!payload.schoolId || !payload.programId)) {
    setUserModalMessage("School and Program are required for student updates.", "error");
    return;
  }

  if (mode === "student" && !updateTargetId) {
    setUserModalMessage("Student ID is required to update student details.", "error");
    return;
  }

  setUserModalSubmitting(true);
  setUserModalMessage("");

  try {
    const apiResponse =
      mode === "student"
        ? await updateStudentUser(updateTargetId, payload, token)
        : await updateUser(updateTargetId, payload, token);

    const updatedListUser = mergeUpdatedUserIntoList(
      recordId,
      mode,
      payload,
      apiResponse,
      updateTargetId
    );
    renderUsersScreen(allUsers);
    setUsersMessage("User updated successfully.", "success");
    bindUsersEvents();

    await openSelectedUserModal(
      updatedListUser,
      normalizeUpdatedDetails(recordId, mode, apiResponse, payload, updateTargetId)
    );
    setUserModalMessage("User updated successfully.", "success");
  } catch (error) {
    setUserModalMessage(error.message || "Failed to update user.", "error");
    console.error("Update user failed:", error);
  } finally {
    setUserModalSubmitting(false);
  }
}

/**
 * Prompts the backend to delete a user record.
 * Supports a specialized mode for deleting from a lookup view without closing modals.
 * @param {string|number} userId - The account to be deactivated/deleted.
 * @param {object} [options={}] - Configuration flags for the deletion flow.
 * @returns {Promise<void>} Resolves after the user is removed from local collections.
 */
async function handleUserDelete(userId, options = {}) {
  const { preserveLookupView = false } = options;
  const token = loadToken();
  if (!token) {
    if (preserveLookupView) {
      setUserLookupMessage("Session expired. Please log in again.", "error");
    } else {
      setUserModalMessage("Session expired. Please log in again.", "error");
    }
    return;
  }

  if (preserveLookupView) {
    setUserLookupSubmitting(true);
    setUserLookupMessage("");
  } else {
    setUserModalSubmitting(true);
    setUserModalMessage("");
  }

  try {
    await deleteUser(userId, token);
    allUsers = allUsers.filter(
      (user) => String(user.id) !== String(userId) && String(user.userId) !== String(userId)
    );
    if (preserveLookupView) {
      setUserLookupMessage("User deleted successfully.", "success");
    } else {
      closeUserModal();
      renderUsersScreen(allUsers);
      setUsersMessage("User deleted successfully.", "success");
      bindUsersEvents();
    }
  } catch (error) {
    if (preserveLookupView) {
      setUserLookupMessage(error.message || "Failed to delete user.", "error");
    } else {
      setUserModalMessage(error.message || "Failed to delete user.", "error");
    }
    console.error("Delete user failed:", error);
  } finally {
    if (preserveLookupView) {
      setUserLookupSubmitting(false);
    } else {
      setUserModalSubmitting(false);
    }
  }
}

/**
 * Handles handle deleted user restore.
 * @param {string|number} userId
 * @returns {Promise<*>}
 */
async function handleDeletedUserRestore(userId) {
  const token = loadToken();
  if (!token) {
    setUserModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  setUserModalSubmitting(true);
  setUserModalMessage("");

  try {
    await restoreDeletedUser(userId, token);
    deletedUsers = deletedUsers.filter((user) => String(user.id) !== String(userId));
    closeUserModal();
    renderDeletedUsersScreen(deletedUsers);
    setUsersMessage("User restored successfully.", "success");
    bindDeletedUsersEvents();
  } catch (error) {
    setUserModalMessage(error.message || "Failed to restore user.", "error");
    console.error("Restore deleted user failed:", error);
  } finally {
    setUserModalSubmitting(false);
  }
}

/**
 * Ensures ensure schools.
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureSchools(token) {
  if (schoolsCache.length > 0) {
    return schoolsCache;
  }

  const responseData = await fetchAllSchools(token);
  schoolsCache = normalizeCollection(responseData);
  return schoolsCache;
}

/**
 * Ensures ensure programs by school.
 * @param {string|number} schoolId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureProgramsBySchool(schoolId, token) {
  if (programsCacheBySchoolId.has(schoolId)) {
    return programsCacheBySchoolId.get(schoolId);
  }

  const responseData = await fetchProgramsBySchool(schoolId, token);
  const programs = normalizeCollection(responseData);
  programsCacheBySchoolId.set(schoolId, programs);
  return programs;
}

/**
 * Merges merge updated user into list.
 * @param {string|number} recordId
 * @param {*} mode
 * @param {object} payload
 * @param {*} apiResponse
 * @param {string|number} updateTargetId
 * @returns {*}
 */
function mergeUpdatedUserIntoList(recordId, mode, payload, apiResponse, updateTargetId) {
  const existingUser = allUsers.find((user) => String(user.id) === String(recordId)) || {};
  const normalizedDetails = normalizeUpdatedDetails(
    recordId,
    mode,
    apiResponse,
    payload,
    updateTargetId
  );

  const updatedUser = {
    ...existingUser,
    ...normalizedDetails,
    id: recordId,
    studentId:
      mode === "student"
        ? normalizedDetails.studentId || existingUser.studentId || updateTargetId
        : existingUser.studentId,
    role: mode === "student" ? "STUDENT" : normalizedDetails.role || existingUser.role
  };

  allUsers = allUsers.map((user) => (String(user.id) === String(recordId) ? updatedUser : user));
  return updatedUser;
}

/**
 * Normalizes normalize updated details.
 * @param {string|number} recordId
 * @param {*} mode
 * @param {*} apiResponse
 * @param {object} fallbackPayload
 * @param {string|number} updateTargetId
 * @returns {*}
 */
function normalizeUpdatedDetails(recordId, mode, apiResponse, fallbackPayload, updateTargetId = recordId) {
  const responseData = apiResponse && typeof apiResponse === "object" ? apiResponse : {};
  if (mode === "student") {
    return {
      ...responseData,
      id: recordId,
      userId: responseData.userId || recordId,
      studentId: responseData.studentId || updateTargetId,
      role: "STUDENT",
      firstName: responseData.firstName || fallbackPayload.firstName,
      lastName: responseData.lastName || fallbackPayload.lastName,
      email: responseData.email || fallbackPayload.email,
      nationalId: responseData.nationalId || fallbackPayload.nationalId,
      secondarySchool: responseData.secondarySchool || fallbackPayload.secondarySchool,
      secondaryPerformance: responseData.secondaryPerformance || fallbackPayload.secondaryPerformance,
      schoolId: responseData.schoolId || fallbackPayload.schoolId,
      programId: responseData.programId || fallbackPayload.programId
    };
  }

  return {
    ...responseData,
    id: recordId,
    firstName: responseData.firstName || fallbackPayload.firstName,
    lastName: responseData.lastName || fallbackPayload.lastName,
    email: responseData.email || fallbackPayload.email,
    role: responseData.role || fallbackPayload.role
  };
}

/**
 * Standardizes API responses into a flat array of user-like entities.
 * Handles generic 'content' wrappers as well as role-specific nested structures.
 * @param {*} responseData - The raw JSON data from the server.
 * @returns {Array<object>} A clean list of records, or an empty array if none found.
 */
function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = ["data", "users", "content", "programs", "schools", "items", "results"];
  for (const key of candidateKeys) {
    const value = responseData[key];
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nested = normalizeCollection(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  // Fallback: some endpoints use non-standard wrapper keys.
  for (const value of Object.values(responseData)) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  for (const value of Object.values(responseData)) {
    if (value && typeof value === "object") {
      const nested = normalizeCollection(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  if (
    responseData.id ||
    responseData.userId ||
    responseData.studentId ||
    responseData.programId ||
    responseData.schoolId
  ) {
    return [responseData];
  }

  return [];
}

/**
 * Scans multiple candidate objects to find a valid Student Identifier.
 * Priorities the most specific source available (e.g., studentId key).
 * @param {Array<object>} candidates - A list of objects to check in order.
 * @returns {string} The found ID, or an empty string if not identified.
 */
function resolveStudentId(...candidates) {
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const studentId = candidate.studentId;
    if (studentId !== null && studentId !== undefined && String(studentId).trim() !== "") {
      return String(studentId);
    }
  }

  return "";
}
