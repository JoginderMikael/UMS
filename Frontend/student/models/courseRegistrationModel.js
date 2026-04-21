/**
 * @fileoverview API operations for student course registration workflows.
 * @module student/models/courseRegistrationModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Registers the student for a single course in the active semester.
 * @param {string} studentId - Unique student identifier.
 * @param {string} courseId - Unique course identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} API registration response.
 */
export async function registerStudentCourse(studentId, courseId, token) {
  const response = await fetch(
    `${API_BASE_URL}/students/me/courses/${encodeURIComponent(studentId)}/${encodeURIComponent(courseId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Register student course");
  }

  return safeParseJson(response);
}

/**
 * Registers the student for multiple courses in one request.
 * @param {string} studentId - Unique student identifier.
 * @param {Array<string>} courseIds - Collection of unique course identifiers.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} API registration response.
 */
export async function registerStudentCoursesBulk(studentId, courseIds, token) {
  const response = await fetch(`${API_BASE_URL}/students/me/courses/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      studentId,
      courseIds
    })
  });

  if (!response.ok) {
    throw await buildApiError(response, "Register student courses in bulk");
  }

  return safeParseJson(response);
}

/**
 * Fetches full curriculum courses for a specific program.
 * Uses /programs/{id}/courses endpoint with course type and year-of-study metadata.
 * @param {string} programId - Program unique identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} Program curriculum course records.
 */
export async function fetchProgramCurriculumCourses(programId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${encodeURIComponent(programId)}/courses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch program curriculum courses");
  }

  return normalizeCollection(await safeParseJson(response));
}

/**
 * Fetches minimal courses affiliated with a student's program.
 * Uses /courses/programs/{programId} endpoint.
 * @param {string} programId - Program unique identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} Program course records.
 */
export async function fetchProgramAffiliatedCourses(programId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/programs/${encodeURIComponent(programId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch program affiliated courses");
  }

  return normalizeCollection(await safeParseJson(response));
}

/**
 * Fetches courses available within a school.
 * @param {string} schoolId - School unique identifier.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} School course records.
 */
export async function fetchSchoolCourses(schoolId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/schools/${encodeURIComponent(schoolId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch school courses");
  }

  return normalizeCollection(await safeParseJson(response));
}

/**
 * Fetches all courses available in the university.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<Array<object>>} University-wide course records.
 */
export async function fetchAllUniversityCourses(token) {
  const response = await fetch(`${API_BASE_URL}/courses/university/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch all university courses");
  }

  return normalizeCollection(await safeParseJson(response));
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

  const candidateKeys = [
    "data",
    "content",
    "items",
    "results",
    "courses",
    "records",
    "programCourses",
    "courseAssociations",
    "associations"
  ];

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

  if (
    responseData.courseId ||
    responseData.CourseId ||
    responseData.programCourseId ||
    responseData.course ||
    responseData.id
  ) {
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

