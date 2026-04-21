/**
 * @fileoverview Data model for Academic Programs.
 * Coordinates persistence for program lifecycles, curriculum mapping,
 * and multi-level organizational associations (School/Department).
 * @module admin/models/programModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Persists a new academic program to the backend registry.
 * @param {object} payload - Program metadata (name, code, school, department).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The confirmed program record.
 */
export async function createProgram(payload, token) {
  const response = await fetch(`${API_BASE_URL}/programs/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Create program");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the complete set of schools available for program placement.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} List of all university schools.
 */
export async function fetchAllSchoolsForPrograms(token) {
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
 * Loads all departments nested within a targeted school for program association.
 * @param {string|number} schoolId - Scope school.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Departments for the given school.
 */
export async function fetchDepartmentsBySchoolForPrograms(schoolId, token) {
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
 * Retrieves a minimal representative list of all academic programs.
 * Optimized for grid displays.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Lightweight program records.
 */
export async function fetchAllProgramsMinimal(token) {
  const response = await fetch(`${API_BASE_URL}/programs/all`, {
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
 * Loads the exhaustive profile for a single program by its ID.
 * @param {string|number} programId - Targeted program.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Full program data.
 */
export async function fetchProgramById(programId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${programId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch program details");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves all programs hosted by a specific school.
 * @param {string|number} schoolId - Scope school filter.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} School-specific programs.
 */
export async function fetchProgramsBySchool(schoolId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/schools/${schoolId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch programs by school");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Retrieves all programs housed in a specific academic department.
 * @param {string|number} departmentId - Department filter.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Department-specific programs.
 */
export async function fetchProgramsByDepartment(departmentId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/departments/${departmentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch programs by department");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Transmits updates to an existing program's core metadata.
 * @param {string|number} programId - ID of program to update.
 * @param {object} payload - New metadata values.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Updated program profile.
 */
export async function updateProgram(programId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${programId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update program");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Requests the permanent removal of a program record.
 * @param {string|number} programId - Targeted ID.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} API confirmation.
 */
export async function deleteProgram(programId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${programId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Delete program");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves all available courses within a school for curriculum mapping to programs.
 * @param {string|number} schoolId - Scope school.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Potential courses for mapping.
 */
export async function fetchCoursesBySchool(schoolId, token) {
  const response = await fetch(`${API_BASE_URL}/courses/schools/${schoolId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch courses by school");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Establishes a formal association between a course and a program's curriculum.
 * @param {string|number} programId - The parent program.
 * @param {string|number} courseId - The course to add.
 * @param {object} payload - Mapping metadata (type, study year).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The confirmed association record.
 */
export async function addCourseToProgram(programId, courseId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/courses/${courseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Add course to program");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the full curriculum list for a targeted program.
 * @param {string|number} programId - The program whose courses are being audited.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} List of program-course associations.
 */
export async function fetchProgramCourses(programId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/courses`, {
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
 * Removes a course from a program's formal curriculum.
 * @param {string|number} programId - Scope program.
 * @param {string|number} courseId - Targeted course association to remove.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Removal confirmation.
 */
export async function removeCourseFromProgram(programId, courseId, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Remove course from program");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Updates the existing association details between a course and a program.
 * @param {string|number} programId - Parent program ID.
 * @param {string|number} courseId - The course in question.
 * @param {object} payload - New mapping values (year, type).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The updated association response.
 */
export async function updateProgramCourseAssociation(programId, courseId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/courses/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Update program course association");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Internal helper to resolve failed fetch responses into descriptive Error objects.
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
    // Keep generic status message if body is not JSON.
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  return error;
}
