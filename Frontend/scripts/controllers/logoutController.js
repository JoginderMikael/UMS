/**
 * @fileoverview Controller responsible for managing User Logout operations.
 * Coordinates with both backend services and frontend persistence to securely
 * terminate active user sessions.
 * @module scripts/controllers/logoutController
 */
import { bindLogoutButton } from "../views/userView.js";
import { clearSession, loadToken } from "../models/sessionModel.js";
import { logoutAuthenticatedUser } from "../models/authModel.js";

/**
 * Orchestrates the logout process for an authenticated user.
 * 1. Attempts to invalidate the current session token via the backend API.
 * 2. Clears all local sensitive session data from storage.
 * 3. Forces a redirection to the application home page.
 * @returns {Promise<void>} Resolves once the logout procedure finishes.
 */
export async function handleLogout() {
  const token = loadToken();

  if (token) {
    try {
      await logoutAuthenticatedUser(token);
    } catch (error) {
      console.error("Logout API request failed:", error);
    }
  }

  clearSession();
  window.location.href = "/index.html";
}

/**
 * Initializes the logout controller by binding the logout routine to UI triggers.
 * Sets up the event listener for the logout button or navigation item.
 * @returns {void} No return value.
 */
export function initLogoutController() {
  bindLogoutButton(handleLogout);
}
