/**
 * @fileoverview Data model for University Fees.
 * Manages program-level fee configuration, student payment records, and clearance tracking.
 * @module admin/models/feeModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Configures a set fee amount for a specific program in a designated semester.
 * @param {object} payload - Fee configuration (programId, semesterId, amount).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The confirmed fee record.
 */
export async function setProgramSemesterFee(payload, token) {
  const response = await fetch(`${API_BASE_URL}/admin/fees/programs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Set program fee");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the global ledger of all student fee payment records.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Historical list of payments.
 */
export async function fetchFeePaymentRecords(token) {
  const response = await fetch(`${API_BASE_URL}/admin/fees/payments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch fee payment records");
  }

  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return [];
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("Failed to parse fee payment records response.");
  }
}

/**
 * Records a student's partial or full payment of their academic fees.
 * @param {object} payload - Payment metadata (studentId, semesterId, amount, date).
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} The confirmed payment record.
 */
export async function recordStudentFeePayment(payload, token) {
  const response = await fetch(`${API_BASE_URL}/admin/fees/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Record fee payment");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the specific fee balance and status for a student in a designated semester.
 * @param {string|number} studentId - Targeted student.
 * @param {string|number} semesterId - Targeted semester.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Detailed status profile (paid, remaining, total).
 */
export async function fetchStudentSemesterFeeStatus(studentId, semesterId, token) {
  const response = await fetch(
    `${API_BASE_URL}/admin/fees/students/${studentId}/semesters/${semesterId}`,
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

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Designates a student's semester fee as fully cleared (paid in full).
 * @param {string|number} studentId - The student.
 * @param {string|number} semesterId - The semester.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Confirmation from the clearing endpoint.
 */
export async function clearStudentSemesterFee(studentId, semesterId, token) {
  const response = await fetch(
    `${API_BASE_URL}/admin/fees/students/${studentId}/semesters/${semesterId}/clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Clear student fee");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetches student identity and metadata using their unique registration number.
 * @param {string} registrationNumber - The number to look up.
 * @param {string} token - Security token.
 * @returns {Promise<object|null>} Minimal student record.
 */
export async function fetchStudentDetailsByRegistrationNumber(registrationNumber, token) {
  const query = encodeURIComponent(registrationNumber);
  const response = await fetch(
    `${API_BASE_URL}/students/registration/details?registrationNumber=${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Fetch student by registration number");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Retrieves the history of fee configurations for a particular program.
 * @param {string|number} programId - Filter by program.
 * @param {string} token - Security token.
 * @returns {Promise<Array<object>>} Historical fee assignments.
 */
export async function fetchProgramFeeRecords(programId, token) {
  const response = await fetch(`${API_BASE_URL}/admin/fees/programs/${programId}/records`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Fetch program fee records");
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Internal utility to map failed fetch responses into descriptive Error instances.
 * Extracts backend-supplied messages from JSON envelopes when present.
 * @param {Response} response - Failed response object.
 * @param {string} action - Operations context label.
 * @returns {Promise<Error>} Descriptive Error instance.
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
