/**
 * @fileoverview Data model for Academic Years and Semesters.
 * Manages the persistence and state transitions of educational cycles.
 * @module admin/models/academicYearModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Persists a new academic year to the university database.
 * @param {string} name - Human-readable label for the academic year (e.g., '2023-2024').
 * @param {string} token - Bearer token for secure API access.
 * @returns {Promise<object|null>} The newly created academic year record.
 */
export async function createAcademicYear(name, token) {
  const response = await fetch(`${API_BASE_URL}/academic-years/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw await buildApiError(response, "Create academic year");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the complete collection of academic years configured in the system.
 * @param {string} token - Security token for authorization.
 * @returns {Promise<Array<object>>} A list of all academic year objects.
 */
export async function fetchAllAcademicYears(token) {
  const response = await fetch(`${API_BASE_URL}/academic-years/all`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch academic years");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Designates a specific academic year as the globally active year.
 * @param {string|number} academicYearId - Unique identifier of the year to activate.
 * @param {string} token - Authorization token.
 * @returns {Promise<object|null>} The confirmation response from the server.
 */
export async function activateAcademicYear(academicYearId, token) {
  const response = await fetch(`${API_BASE_URL}/academic-years/${academicYearId}/activate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Activate academic year");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetches all child semesters associated with a parent academic year.
 * @param {string|number} academicYearId - The parent year ID.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} The list of semesters for that year.
 */
export async function fetchSemestersByAcademicYear(academicYearId, token) {
  const response = await fetch(`${API_BASE_URL}/academic-years/${academicYearId}/semesters`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch semesters");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Adds a new semester to an existing academic year.
 * @param {string|number} academicYearId - The target year.
 * @param {number|string} number - The semester designation (e.g., '1' or '2').
 * @param {string} token - Authentication token.
 * @returns {Promise<object|null>} The created semester entry.
 */
export async function createSemester(academicYearId, number, token) {
  const query = encodeURIComponent(String(number));
  const response = await fetch(`${API_BASE_URL}/academic-years/${academicYearId}/semesters?number=${query}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ number })
  });

  if (!response.ok) {
    throw await buildApiError(response, "Create semester");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Activates a specific semester, making it the current registration/teaching period.
 * @param {string|number} semesterId - Unique semester ID.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Status response from the backend.
 */
export async function activateSemester(semesterId, token) {
  const response = await fetch(`${API_BASE_URL}/semesters/${semesterId}/activate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Activate semester");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Internal utility to transform failed API responses into informative Error objects.
 * Attempts to extract detailed server-side error messages from JSON bodies.
 * @param {Response} response - The failed fetch Response object.
 * @param {string} action - Descriptive name of the operation being performed.
 * @returns {Promise<Error>} An enhanced Error instance with status and message.
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
