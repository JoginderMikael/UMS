/**
 * Shared utility exports used across multiple application modules.
 * This module acts as a facade, re-exporting core session management and
 * user interface update functions to provide a consistent utility API.
 * @module scripts/utils
 */

/**
 * Persist an authentication token to the browser's session storage.
 * Used to maintain user identity across page transitions within a session.
 * @function saveToken
 * @param {string} token - The JWT or session token to be stored.
 * @returns {void} No return value.
 */
/**
 * Retrieves the persisted authentication token from the browser's session storage.
 * Essential for making authenticated API requests.
 * @function loadToken
 * @returns {(string|null)} The stored token if found, otherwise null.
 */
/**
 * Persist the active user's profile object to the browser's session storage.
 * Stores user-specific data like role, name, and ID for quick access in the UI.
 * @function saveCurrentUser
 * @param {object} user - The user data object received after authentication.
 * @returns {void} No return value.
 */
/**
 * Retrieves the currently logged-in user's profile data from session storage.
 * Useful for personalization and role-based access control within the frontend.
 * @function loadCurrentUser
 * @returns {(object|null)} The user object if available, otherwise null.
 */
export { saveToken, loadToken, saveCurrentUser, loadCurrentUser } from "./models/sessionModel.js";

/**
 * Updates the active user's name displayed in the header or navigation bar of the UI.
 * Synchronizes the visual representation of the current session with the stored user data.
 * @function setActiveUserName
 * @param {string} userName - The name to be displayed in the interface.
 * @returns {void} No return value.
 */
export { showActiveUserName as setActiveUserName } from "./views/userView.js";
