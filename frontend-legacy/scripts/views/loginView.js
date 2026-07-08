/**
 * @fileoverview View module responsible for UI interactions on the Login page.
 * Manages form binding, error display, and redirection logic.
 * @module scripts/views/loginView
 */
/**
 * Establishes an event listener on the login submit button.
 * Prevents default form behavior and extracts credentials before invoking the callback.
 * @param {Function} onSubmit - The callback function to execute with the user credentials.
 * @returns {void} No return value.
 */
export function bindLoginSubmit(onSubmit) {
  const loginButton = document.querySelector(".js-login-button");
  if (!loginButton) {
    return;
  }

  loginButton.addEventListener("click", (event) => {
    event.preventDefault();
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    onSubmit({
      email: emailInput ? emailInput.value : "",
      password: passwordInput ? passwordInput.value : ""
    });
  });
}

/**
 * Displays a failed login message in the UI's designated error region.
 * @param {string} message - The error message text to be shown to the user.
 * @returns {void} No return value.
 */
export function showLoginError(message) {
  const failedEl = document.querySelector(".js-failed-response");
  if (!failedEl) {
    return;
  }

  failedEl.innerHTML = `<div class="js-response-failed">${message}</div>`;
}

/**
 * Removes any active login error messages from the interface.
 * @returns {void} No return value.
 */
export function clearLoginError() {
  const failedEl = document.querySelector(".js-failed-response");
  if (!failedEl) {
    return;
  }

  failedEl.innerHTML = "";
}

/**
 * Performs a browser-level redirection to the dashboard appropriate for the user's role.
 * @param {string} role - The user's role string (e.g., 'ADMIN', 'STUDENT').
 * @returns {void} Triggers navigation.
 */
export function redirectToRoleHome(role) {
  if (role === "ADMIN") {
    window.location.href = "admin/admin.html";
    return;
  }

  if (role === "STUDENT") {
    window.location.href = "student/student.html";
    return;
  }

  if (role === "FACULTY") {
    window.location.href = "faculty/faculty.html";
  }
}
