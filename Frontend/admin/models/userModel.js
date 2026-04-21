/**
 * @fileoverview Data model for User management.
 * Coordinates persistence for general users, administrators, and specialized student roles.
 * Supports soft-deletion and multi-level organizational lookups.
 * @module admin/models/userModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

const STUDENT_UPDATE_PATH = "students";

/**
 * Persists a new user record to the university system.
 * @param {object} payload - User metadata (email, name, role, school association).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The created user record.
 */
export async function createUser(payload, token) {
  const response = await fetch(`${API_BASE_URL}/users/createuser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Create user");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the complete list of all active users in the system.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Exhaustive user collection.
 */
export async function fetchAllUsers(token) {
  const response = await fetch(`${API_BASE_URL}/users/allusers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch users");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Retrieves the archive of all formally soft-deleted users.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} List of recoverable user accounts.
 */
export async function fetchAllDeletedUsers(token) {
  const response = await fetch(`${API_BASE_URL}/users/allDeleted`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch deleted users");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Loads the full profile of a single user by their ID.
 * @param {string|number} id - Targeted user ID.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Detailed user profile data.
 */
export async function fetchUserById(id, token) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch user by ID");
  }

  return response.json();
}

/**
 * Performs a targeted user lookup by email address.
 * @param {string} email - Search email.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Minimal user record matched.
 */
export async function fetchUserByEmail(email, token) {
  const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch user by email");
  }

  return response.json();
}

/**
 * Submits metadata updates for an existing user account.
 * @param {string|number} id - Identity of user.
 * @param {object} payload - New field values.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Updated user response.
 */
export async function updateUser(id, payload, token) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update user");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Requests the permanent removal of a user account (soft-delete).
 * @param {string|number} id - Target ID.
 * @param {string} token - Security token.
 * @returns {Promise<void>} Resolves once the account is flagged as deleted.
 */
export async function deleteUser(id, token) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    throw await buildApiError(response, "Delete user");
  }
}

/**
 * Restores a soft-deleted user account to active status.
 * @param {string|number} id - Recovery target ID.
 * @param {string} token - Security token.
 * @returns {Promise<void>} Resolves once the account is active again.
 */
export async function restoreDeletedUser(id, token) {
  const response = await fetch(`${API_BASE_URL}/users/${id}/restore`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    throw await buildApiError(response, "Restore user");
  }
}

/**
 * Special handling for updating student-specific metadata (Registration number, Level, etc.).
 * @param {string|number} studentId - Targeted student record.
 * @param {object} payload - New student-specific data.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Updated student metadata response.
 */
export async function updateStudentUser(studentId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/${STUDENT_UPDATE_PATH}/${studentId}/details`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update student");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the comprehensive school list available for user/student assignment.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} List of all university schools.
 */
export async function fetchAllSchools(token) {
  const response = await fetch(`${API_BASE_URL}/schools/getAll`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch schools");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Retrieves all academic programs offered within a specific school for assignment workflows.
 * @param {string|number} schoolId - Scope school ID.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Programs available in that school.
 */
export async function fetchProgramsBySchool(schoolId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/schools/${schoolId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch programs");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Internal helper to resolve failed response objects into descriptive Errors.
 * Attempts to parse server-side diagnostic information from JSON bodies.
 * @param {Response} response - Failed response.
 * @param {string} action - Descriptive label for the failed task.
 * @returns {Promise<Error>} Error instance with backend context.
 */
async function buildApiError(response, action) {
  let errorMessage = `${action} failed with status ${response.status}`;

  try {
    const errorBody = await response.json();
    errorMessage = errorBody.message || errorBody.error || errorMessage;
  } catch {
    // Keep generic status message if response body is not JSON.
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  return error;
}
