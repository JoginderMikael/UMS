/**
 * @fileoverview API operations for student transcript and result workflows.
 * @module student/models/transcriptModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Fetches and generates transcript for the authenticated student.
 * @param {string} studentId - Unique student identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} Transcript payload.
 */
export async function fetchStudentTranscript(studentId, token) {
  const response = await fetch(`${API_BASE_URL}/students/me/${encodeURIComponent(studentId)}/transcript`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch student transcript");
  }

  const payload = await safeParseJson(response);
  const entity = unwrapEntity(payload);
  return entity && typeof entity === "object" ? entity : null;
}

async function safeParseJson(response) {
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

function unwrapEntity(responseData) {
  if (!responseData || typeof responseData !== "object" || Array.isArray(responseData)) {
    return responseData;
  }

  const wrapperKeys = ["data", "result", "item", "content", "payload", "record"];
  for (const key of wrapperKeys) {
    const value = responseData[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return unwrapEntity(value);
    }
  }

  return responseData;
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
