/**
 * @fileoverview API operations for student exam registration workflows.
 * @module student/models/examRegistrationModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Fetches all registered courses for the student in the active semester.
 * @param {string} studentId - Unique student identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} Registered course records.
 */
export async function fetchStudentRegisteredCoursesForExams(studentId, token) {
  const response = await fetch(`${API_BASE_URL}/students/me/courses/${encodeURIComponent(studentId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch registered courses for exam registration");
  }

  return normalizeCollection(await safeParseJson(response));
}

/**
 * Fetches exam registration status for the student's registered courses.
 * @param {string} studentId - Unique student identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} Exam status records.
 */
export async function fetchStudentExamStatusesForCourses(studentId, token) {
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
    throw await buildApiError(response, "Fetch exam registration status");
  }

  return normalizeCollection(await safeParseJson(response));
}

/**
 * Registers student for a course exam.
 * @param {string} studentId - Unique student identifier.
 * @param {string} courseId - Unique course identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} API response.
 */
export async function registerStudentForCourseExam(studentId, courseId, token) {
  const response = await fetch(
    `${API_BASE_URL}/students/me/courses/${encodeURIComponent(studentId)}/${encodeURIComponent(courseId)}/exam`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Register student for course exam");
  }

  return safeParseJson(response);
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
