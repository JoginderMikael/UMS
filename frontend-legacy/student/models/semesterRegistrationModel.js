/**
 * @fileoverview API operations for student semester enrollment workflows.
 * @module student/models/semesterRegistrationModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Enrolls student in the currently active semester.
 * @param {string} studentId - Unique student identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} API enrollment response.
 */
export async function enrollStudentInCurrentSemester(studentId, token) {
  const response = await fetch(
    `${API_BASE_URL}/students/me/semesters/enroll/${encodeURIComponent(studentId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Enroll student in current semester");
  }

  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

async function buildApiError(response, action) {
  let errorMessage = `${action} failed with status ${response.status}`;

  try {
    const errorBody = await response.json();
    errorMessage = errorBody.message || errorBody.error || errorMessage;
  } catch {
    // Keep fallback error message.
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  return error;
}

