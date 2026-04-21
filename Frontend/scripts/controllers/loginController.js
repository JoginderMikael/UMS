/**
 * @fileoverview Controller managing the authentication logic for the login page.
 * Handles the user login flow, session establishment, and error reporting.
 * @module scripts/controllers/loginController
 */
import { loginWithCredentials, fetchCurrentUser } from "../models/authModel.js";
import { saveToken, saveCurrentUser } from "../models/sessionModel.js";
import { bindLoginSubmit, showLoginError, clearLoginError, redirectToRoleHome } from "../views/loginView.js";

let failedMsgTimer;

/**
 * Initializes the login controller by binding interaction events to the login form.
 * Sets up the listener for form submission to trigger the authentication flow.
 * @returns {void} No return value.
 */
export function initLoginController() {
  bindLoginSubmit(handleLoginSubmit);
}

/**
 * Orchestrates the login submission process.
 * Steps include:
 * 1. Authenticating credentials against the backend API.
 * 2. Persisting the returned security token.
 * 3. Fetching and persisting the full user profile.
 * 4. Redirecting the user to their role-specific dashboard.
 * 5. Displaying and auto-clearing error messages on failure.
 * @param {object} params - The login credentials received from the view.
 * @param {string} params.email - The user's login email address.
 * @param {string} params.password - The user's login password.
 * @returns {Promise<void>} Resolves when the login flow successfully completes or fails.
 */
async function handleLoginSubmit({ email, password }) {
  try {
    const loginData = await loginWithCredentials(email, password);
    saveToken(loginData.token);

    const user = await fetchCurrentUser(loginData.token);
    saveCurrentUser(user);

    redirectToRoleHome(user.role);
  } catch (error) {
    showLoginError("Login failed. Please check your credentials.");

    if (failedMsgTimer) {
      clearTimeout(failedMsgTimer);
    }

    failedMsgTimer = setTimeout(() => {
      clearLoginError();
    }, 5000);

    console.error("Login flow failed:", error);
  }
}
