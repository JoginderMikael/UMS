/**
 * @fileoverview Persistence model for managing user sessions in browser storage.
 * Provides a standardized interface for saving and retrieving sensitive 
 * authentication data like tokens and profile snapshots.
 * @module scripts/models/sessionModel
 */
const TOKEN_KEY = "token";
const CURRENT_USER_KEY = "currentUserData";

/**
 * Saves the authentication token to the browser's persistent local storage.
 * @param {string} token - The JWT or session identifier token.
 * @returns {void} No return value.
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Loads the stored authentication token from local storage.
 * @returns {string|null} The token string if it exists, otherwise null.
 */
export function loadToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Persists the current user's profile data as a JSON string in local storage.
 * Useful for maintaining UI context without repeated API calls.
 * @param {object} user - The user profile data object.
 * @returns {void} No return value.
 */
export function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

/**
 * Retrieves and parses the current user's profile data from local storage.
 * @returns {object|null} The parsed user object, or null if missing or corrupted.
 */
export function loadCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Completely clears all session-related data from the browser's local storage.
 * Used during logout or session expiration to ensure data privacy.
 * @returns {void} No return value.
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}
