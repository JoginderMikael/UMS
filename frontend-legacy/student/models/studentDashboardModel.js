/**
 * @fileoverview API operations for student dashboard summary data.
 * @module student/models/studentDashboardModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Fetches the collection of courses for which the student is currently registered.
 * @param {string} studentId - Unique student identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} Collection of course registration records.
 */
export async function fetchStudentRegisteredCourses(studentId, token) {
  const response = await fetch(`${API_BASE_URL}/students/me/courses/${encodeURIComponent(studentId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch student registered courses");
  }

  return normalizeCollection(await safeParseJson(response));
}

/**
 * Fetches exam eligibility and registration statuses for the student's courses.
 * @param {string} studentId - Unique student identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} Collection of exam status records.
 */
export async function fetchStudentExamStatuses(studentId, token) {
  const response = await fetch(
    `${API_BASE_URL}/students/me/courses/${encodeURIComponent(studentId)}/exam-status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Fetch course exam status");
  }

  return normalizeCollection(await safeParseJson(response));
}

/**
 * Fetches the financial standing/fee status for a student in a specific semester.
 * @param {string} studentId - Unique student identifier.
 * @param {string} semesterId - The semester to query.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} The student's fee status object or null.
 */
export async function fetchStudentFeeStatus(studentId, semesterId, token) {
  const response = await fetch(
    `${API_BASE_URL}/students/${encodeURIComponent(studentId)}/fees/${encodeURIComponent(semesterId)}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Fetch student fee status");
  }

  const payload = await safeParseJson(response);
  const entity = unwrapEntity(payload);
  return entity && typeof entity === "object" ? entity : null;
}

/**
 * Fetches a user profile by user ID.
 * Used as a fallback source when /users/me payload misses identifiers.
 * @param {string} userId - User unique identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} User profile object.
 */
export async function fetchUserProfileById(userId, token) {
  const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch user profile by ID");
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

function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = ["data", "content", "items", "results", "courses", "records"];
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

  if (responseData.courseId || responseData.registrationId || responseData.studentId) {
    return [responseData];
  }

  return [];
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

