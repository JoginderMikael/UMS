/**
 * @fileoverview Controller for the public home page of the application.
 * Manages the display of the current user in the navigation bar and
 * orchestrates the homepage carousel animation.
 * @module scripts/controllers/homeController
 */
import { readCarouselImages, renderActiveCarouselImage } from "../views/carouselView.js";
import { loadCurrentUser } from "../models/sessionModel.js";

/**
 * Determines the redirection path for a user based on their specific role.
 * Maps application roles (ADMIN, STUDENT, FACULTY) to their respective landing pages.
 * @param {string} role - The user's assigned role in the system.
 * @returns {string} The relative URL of the designated landing page for the role.
 */
function getRoleHomePath(role) {
  const roleKey = String(role || "").toUpperCase();
  if (roleKey === "ADMIN") {
    return "/admin/admin.html";
  }

  if (roleKey === "STUDENT") {
    return "/student/student.html";
  }

  if (roleKey === "FACULTY") {
    return "/faculty/faculty.html";
  }

  return "/login.html";
}

/**
 * Updates the navigation bar to reflect the currently logged-in user.
 * If a session is active, replaces the 'Login' button with the user's full name
 * and updates its destination link to their specific dashboard.
 * @returns {void} No return value.
 */
function renderCurrentUserInNav() {
  const loginLink = document.querySelector(".login-btn");
  const user = loadCurrentUser();
  if (!loginLink || !user) {
    return;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (!fullName) {
    return;
  }

  loginLink.textContent = fullName;
  loginLink.setAttribute("href", getRoleHomePath(user.role));
  loginLink.classList.remove("login-btn");
  loginLink.classList.add("current-user-name");
}

/**
 * Initializes the home page controller logic.
 * Performs the following:
 * 1. Synchronizes the navigation bar with active session state.
 * 2. Reads carousel image data and begins the automated transitions.
 * @returns {void} No return value.
 */
export function initHomeController() {
  renderCurrentUserInNav();

  const images = readCarouselImages();
  if (!images.length) {
    return;
  }

  let currentIndex = 0;

  setInterval(() => {
    const previousIndex = currentIndex;
    currentIndex = (currentIndex + 1) % images.length;
    renderActiveCarouselImage(images, previousIndex, currentIndex);
  }, 4000);
}
