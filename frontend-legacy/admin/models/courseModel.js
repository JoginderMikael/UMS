/**
 * @fileoverview Data model for University Courses.
 * Manages course definitions, school/program/department associations, and CRUD logic.
 * @module admin/models/courseModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Requests the creation of a new course record.
 * @param {object} payload - Course metadata (name, code, credits, etc.).
 * @param {string} token - Bearer token for authentication.
 * @returns {Promise<object|null>} The confirmed course record.
 */
export async function createCourse(payload, token) {
  const response = await fetch(`${API_BASE_URL}/courses/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Create course");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the full profile of a single course by its ID.
 * @param {string|number} courseId - The unique course identifier.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Detailed course data.
 */
export async function fetchCourseById(courseId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch course details");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Loads all courses offered within a specific school.
 * @param {string|number} schoolId - The school to filter by.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} List of school-specific courses.
 */
export async function fetchCoursesBySchool(schoolId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/schools/${schoolId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch school courses");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Loads all courses hosted by a specific academic department.
 * @param {string|number} departmentId - Filter department.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Courses associated with the department.
 */
export async function fetchCoursesByDepartment(departmentId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/departments/${departmentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch department courses");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Fetches courses linked to a particular academic program.
 * @param {string|number} programId - The target program.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} The program's course curriculum.
 */
export async function fetchCoursesByProgram(programId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/programs/${programId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch program courses");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Loads the exhaustive list of every course across the entire university system.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Full university course catalog.
 */
export async function fetchAllUniversityCourses(token) {
  const response = await fetch(`${API_BASE_URL}/courses/university/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch all courses");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Submits an update to an existing course's metadata.
 * @param {string|number} courseId - Identity of the course.
 * @param {object} payload - New field values.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The updated course response.
 */
export async function updateCourse(courseId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update course");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Requests the permanent deletion of a course record.
 * @param {string|number} courseId - Targeted course ID.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} API confirmation response.
 */
export async function deleteCourse(courseId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Delete course");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Internal helper to resolve failed fetch responses into structured Error objects.
 * Parses backend JSON error envelopes to provide specific diagnostic messages.
 * @param {Response} response - The raw fetch response.
 * @param {string} action - Contextual name of the operation.
 * @returns {Promise<Error>} An error populated with backend feedback.
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
