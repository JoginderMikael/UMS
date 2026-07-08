/**
 * @fileoverview Logic and initialization for the system's login page.
 * This module is responsible for setting up the authentication flow on the login screen.
 * @module scripts/login
 */
import { initLoginController } from "./controllers/loginController.js";

/**
 * Entry module for the login page initialization.
 * Key responsibilities:
 * - Bootstrapping the login controller to handle user input and API calls.
 * - Binding UI events specific to the login form.
 * @module scripts/login
 */

/**
 * Bootstraps the behavior and event handling for the login page.
 * Invokes the initLoginController to establish form listeners and validation logic.
 * @returns {void} Does not return anything.
 */
function bootstrapLoginPage() {
  initLoginController();
}

bootstrapLoginPage();
