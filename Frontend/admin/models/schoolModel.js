/**
 * @fileoverview Data model for University Schools.
 * Handles persistence for school records, including updates, soft-deletion, and recovery.
 * @module admin/models/schoolModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Registers a new university school in the backend.
 * @param {object} payload - School metadata (name, code).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The confirmed school record.
 */
export async function createSchool(payload, token) {
  const response = await fetch(`${API_BASE_URL}/schools/addSchool`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Create school");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the complete list of active university schools.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Active schools collection.
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
 * Submits updates to a school's core metadata.
 * @param {string|number} id - Identification of the school.
 * @param {object} payload - New name or code values.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The updated school record.
 */
export async function updateSchool(id, payload, token) {
  const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update school");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Requests the permanent removal of a school record (soft-delete on backend).
 * @param {string|number} id - Target ID.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Confirmation response.
 */
export async function deleteSchool(id, token) {
  const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Delete school");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the archive of all formally soft-deleted schools.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} List of recoverable schools.
 */
export async function fetchAllDeletedSchools(token) {
  const response = await fetch(`${API_BASE_URL}/schools/deletedSchools`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch deleted schools");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Restores a soft-deleted school to an active status.
 * @param {string|number} id - Target ID.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Confirmation from the restoration endpoint.
 */
export async function restoreDeletedSchool(id, token) {
  const response = await fetch(`${API_BASE_URL}/schools/${id}/restore`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Restore school");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Internal helper to resolve failed fetch responses into descriptive Errors.
 * Attempts to parse server-side diagnostic information from JSON bodies.
 * @param {Response} response - Failed response.
 * @param {string} action - Contextual label for the failed task.
 * @returns {Promise<Error>} Error instance with backend context.
 */
async function buildApiError(response, action) {
  let errorMessage = `${action} failed with status ${response.status}`;

  try {
    const errorBody = await response.json();
    errorMessage = errorBody.message || errorBody.error || errorMessage;
  } catch {
    // Keep generic status message when body is not JSON.
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  return error;
}
