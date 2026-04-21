/**
 * @fileoverview API operations for student fee payment workflows.
 * @module student/models/feePaymentModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

/**
 * Records a fee payment for a student in a specific semester.
 * @param {string} studentId - Unique student identifier.
 * @param {string} semesterId - Unique semester identifier.
 * @param {number} amount - Paid amount.
 * @param {string} token - Authorization bearer token.
 * @returns {Promise<object|null>} Payment response payload.
 */
export async function payStudentFees(studentId, semesterId, amount, token) {
  const response = await fetch(
    `${API_BASE_URL}/students/${encodeURIComponent(studentId)}/fees/${encodeURIComponent(semesterId)}/pay`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    }
  );

  if (!response.ok) {
    throw await buildApiError(response, "Pay student fees");
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
