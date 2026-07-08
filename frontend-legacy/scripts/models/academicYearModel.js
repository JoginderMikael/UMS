/**
 * @fileoverview Data model for interacting with Academic Year resources.
 * This module provides functions to fetch calendar and academic session data 
 * from the backend API.
 * @module scripts/models/academicYearModel
 */
import { API_BASE_URL } from "./apiConfig.js";

/**
 * Fetches the complete list of all academic years configured in the system.
 * Supports both public access and authenticated access via a Bearer token.
 * @param {string} [token=""] - Optional authentication token for the request.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of academic year objects.
 * @throws {Error} Throws an error if the network request fails or returns a non-200 status.
 */
export async function fetchAllAcademicYears(token = "") {
  const response = await fetch(`${API_BASE_URL}/academic-years/all`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    const error = new Error(`Fetch academic years failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  try {
    return await response.json();
  } catch {
    return [];
  }
}
