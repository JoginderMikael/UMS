/**
 * @fileoverview Main entry point for the frontend application.
 * This module handles the initialization of the home page by bootstrapping
 * the necessary controllers and event listeners.
 * @module scripts/script
 */
import { initHomeController } from "./controllers/homeController.js";

/**
 * Entry module for the home page.
 * Responsibilities include:
 * - Calling the bootstrap function to initialize components.
 * - Ensuring the home page controller is set up correctly on load.
 * @module scripts/script
 */

/**
 * Bootstraps the home page behavior and logic.
 * This is the primary initialization routine called when the home page loads.
 * It coordinates with the homeController to bind dynamic behaviors to the landing page UI.
 * @returns {void} No return value.
 */
function bootstrapHomePage() {
  initHomeController();
}

bootstrapHomePage();
