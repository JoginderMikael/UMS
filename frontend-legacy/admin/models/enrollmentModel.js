/**
 * @fileoverview Data model for Student Enrollments.
 * Coordinates persistence for the student admission process and enrollment status tracking.
 * @module admin/models/enrollmentModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Submits a new student admission/enrollment record.
 * @param {object} payload - Student personal data, school, and program selection.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The created enrollment record.
 */
export async function enrollStudent(payload, token) {
  const response = await fetch(`${API_BASE_URL}/enrollments/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Enroll student");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the comprehensive list of all student enrollments from the backend.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} The university's enrollment ledger.
 */
export async function fetchAllEnrollments(token) {
  const response = await fetch(`${API_BASE_URL}/enrollments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch enrollments");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Updates the lifecycle status of a student's enrollment (e.g., ADMITTED, REJECTED).
 * @param {string|number} enrollmentId - Targeted enrollment entry.
 * @param {string} status - The new status string.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The confirmed status update response.
 */
export async function updateEnrollmentStatus(enrollmentId, status, token) {
  const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update enrollment status");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Formally cancels a student's enrollment with a required justification.
 * @param {string|number} enrollmentId - ID of the record to cancel.
 * @param {string} reason - Detailed explanation for the cancellation.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Status response from the backend.
 */
export async function cancelEnrollment(enrollmentId, reason, token) {
  const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });

  if (!response.ok) {
    throw await buildApiError(response, "Cancel enrollment");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Common helper to resolve failed response objects into descriptive Errors.
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
    try {
      const fallbackText = await response.text();
      if (fallbackText) {
        errorMessage = fallbackText;
      }
    } catch {
      // Keep generic status message if response body cannot be read.
    }
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  return error;
}
