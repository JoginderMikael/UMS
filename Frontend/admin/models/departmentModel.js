/**
 * @fileoverview Data model for Academic Departments.
 * Handles specialized persistence logic for departments, including school nesting
 * and soft-deletion recovery.
 * @module admin/models/departmentModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Creates a new academic department within a specific school.
 * @param {string|number} schoolId - The parent school identifier.
 * @param {object} payload - Department metadata (name, code).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The finalized department record.
 */
export async function createDepartment(schoolId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/${schoolId}/departments/addDepartment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Create department");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the set of schools available for department assignment.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} A broad list of all schools.
 */
export async function fetchAllSchoolsForDepartments(token) {
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
 * Loads all departments nested under a particular school.
 * @param {string|number} schoolId - The target school.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} The school's primary department collection.
 */
export async function fetchAllDepartmentsBySchool(schoolId, token) {
  const response = await fetch(`${API_BASE_URL}/${schoolId}/departments/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch departments");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Updates core department metadata on the server.
 * @param {string|number} schoolId - Scope constraint (parent school).
 * @param {string|number} departmentId - Specific ID to update.
 * @param {object} payload - New name or code values.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The updated record.
 */
export async function updateDepartment(schoolId, departmentId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/${schoolId}/departments/${departmentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update department");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Deletes a department record from its parent school context.
 * Performs a soft-delete on the server.
 * @param {string|number} schoolId - Parent school.
 * @param {string|number} departmentId - Target department.
 * @param {string} token - Security token.
 * @returns {Promise<void>} Resolves once the deletion is accepted.
 */
export async function deleteDepartment(schoolId, departmentId, token) {
  const response = await fetch(`${API_BASE_URL}/${schoolId}/departments/${departmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    throw await buildApiError(response, "Delete department");
  }
}

/**
 * Loads all previously deleted departments for a specific school.
 * @param {string|number} schoolId - Scope school.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} The school's archive of deleted departments.
 */
export async function fetchAllDeletedDepartmentsBySchool(schoolId, token) {
  const response = await fetch(`${API_BASE_URL}/${schoolId}/departments/allDeleted`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch deleted departments");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Requests the restoration of a soft-deleted department to an active state.
 * @param {string|number} schoolId - Scoping school ID.
 * @param {string|number} departmentId - Target ID to recover.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Response from the restoration endpoint.
 */
export async function restoreDeletedDepartment(schoolId, departmentId, token) {
  const response = await fetch(`${API_BASE_URL}/${schoolId}/departments/${departmentId}/restore`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Restore department");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Standard utility for resolving failed API responses into informative Error instances.
 * Pulls detailed backend feedback from JSON bodies when available.
 * @param {Response} response - Fetch result.
 * @param {string} action - Contextual operation label.
 * @returns {Promise<Error>} Enriched Error object.
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
