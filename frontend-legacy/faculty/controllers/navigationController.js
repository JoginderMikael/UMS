/**
 * @fileoverview Controller for faculty portal navigation interactions.
 * @module faculty/controllers/navigationController
 */

/**
 * Initializes responsive faculty sidebar menu interactions.
 * @returns {void}
 */
export function initFacultyMenuView() {
  const menuButton = document.querySelector(".js-menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const menuBackdrop = document.querySelector(".js-menu-backdrop");
  if (!menuButton || !sidebar || !menuBackdrop) {
    return;
  }

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  sidebar.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("a")) {
      closeMenu();
    }
  });

  menuBackdrop.addEventListener("click", closeMenu);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      closeMenu();
    }
  });
}

/**
 * Initializes faculty panel navigation behavior.
 * @returns {void}
 */
export function initFacultyPanelNavigation() {
  const resultsAndGradingLink = document.querySelector('.student-menu-link[href="#faculty-results-grading"]');
  const facultyHomeTrigger = document.querySelector(".js-faculty-home");
  const resultsAndGradingPanel = document.querySelector("#faculty-results-grading-page");

  if (!resultsAndGradingLink || !resultsAndGradingPanel) {
    return;
  }

  const openFocusMode = (modeClass, panel) => {
    document.body.classList.remove("faculty-results-grading-focus");
    document.body.classList.add(modeClass);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeFocusModes = () => {
    document.body.classList.remove("faculty-results-grading-focus");
  };

  resultsAndGradingLink.addEventListener("click", (event) => {
    event.preventDefault();
    openFocusMode("faculty-results-grading-focus", resultsAndGradingPanel);
  });

  if (facultyHomeTrigger) {
    const openFacultyHome = () => {
      closeFocusModes();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    facultyHomeTrigger.addEventListener("click", openFacultyHome);
    facultyHomeTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFacultyHome();
      }
    });
  }
}
