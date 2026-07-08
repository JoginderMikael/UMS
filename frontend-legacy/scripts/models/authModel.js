/**
 * @fileoverview Authentication and Identity data model.
 * Handles primary security operations including login, current user profile retrieval,
 * and session termination on the backend.
 * @module scripts/models/authModel
 */
import { API_BASE_URL } from "./apiConfig.js";

/**
 * Authenticates a user using their email and password.
 * @param {string} email - The user's account email.
 * @param {string} password - The user's account password.
 * @returns {Promise<object>} A promise resolving to the login response (including the JWT token).
 * @throws {Error} Throws if credentials are invalid or the server is unreachable.
 */
export async function loginWithCredentials(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = new Error(`Login request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Retrieves the profile of the currently authenticated user based on the provided token.
 * Automatically unwraps the response to provide direct access to the user entity.
 * @param {string} token - The active JWT bearer token.
 * @returns {Promise<object>} A promise resolving to the user profile data.
 */
export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = new Error(`Fetch current user failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  return unwrapEntity(payload);
}

/**
 * Requests the backend to invalidate the provided authentication token.
 * Part of the secure logout flow to ensure tokens cannot be reused.
 * @param {string} token - The security token to be invalidated.
 * @returns {Promise<void>} Resolves when the backend acknowledges the logout.
 */
export async function logoutAuthenticatedUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = new Error(`Logout request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
}

/**
 * Recursively unwraps API response structures to extract target entities.
 * Navigates through common result wrappers like 'data', 'item', or 'result'
 * to return the core business data.
 * @param {object} value - The raw JSON response from the API.
 * @returns {object} The unwrapped entity or original value if no wrapper is found.
 */
function unwrapEntity(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const wrapperKeys = ["data", "result", "item", "content", "payload", "record"];
  for (const key of wrapperKeys) {
    const nested = value[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return unwrapEntity(nested);
    }
  }

  return value;
}
