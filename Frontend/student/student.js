/**
 * @fileoverview Frontend module.
 * @module student/student
 */
import { initRoleController } from "../scripts/controllers/roleController.js";
import { initLogoutController } from "../scripts/controllers/logoutController.js";
import { initStudentDashboardController } from "./controllers/studentDashboardController.js";

/**
 * Initializes responsive student sidebar menu interactions.
 * @returns {void}
 */
function initStudentMenuView() {
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
 * Initializes student panel navigation behavior.
 * Replaces dashboard view with focused course-registration view when requested.
 * @returns {void}
 */
function initStudentPanelNavigation() {
  const registerCoursesLink = document.querySelector('.student-menu-link[href="#register-courses"]');
  const payFeesLink = document.querySelector('.student-menu-link[href="#pay-fees"]');
  const registerSemesterLink = document.querySelector('.student-menu-link[href="#register-semester"]');
  const registerExamsLink = document.querySelector('.student-menu-link[href="#register-exams"]');
  const resultsTranscriptLink = document.querySelector('.student-menu-link[href="#results-transcripts"]');
  const studentHomeTrigger = document.querySelector(".js-student-home");
  const menuLinks = document.querySelectorAll(".student-menu-link");
  const coursesPanel = document.querySelector("#register-courses");
  const feePaymentPanel = document.querySelector("#fee-payment-page");
  const semesterPanel = document.querySelector("#register-semester");
  const examPanel = document.querySelector("#exam-registration-page");
  const resultsTranscriptPanel = document.querySelector("#results-transcripts-page");
  if (
    !registerCoursesLink ||
    !payFeesLink ||
    !coursesPanel ||
    !feePaymentPanel ||
    !registerSemesterLink ||
    !semesterPanel ||
    !registerExamsLink ||
    !examPanel ||
    !resultsTranscriptLink ||
    !resultsTranscriptPanel
  ) {
    return;
  }

  const openFocusMode = (modeClass, panel) => {
    document.body.classList.remove(
      "course-registration-focus",
      "semester-registration-focus",
      "exam-registration-focus",
      "fee-payment-focus",
      "transcript-results-focus"
    );
    document.body.classList.add(modeClass);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeFocusModes = () => {
    document.body.classList.remove(
      "course-registration-focus",
      "semester-registration-focus",
      "exam-registration-focus",
      "fee-payment-focus",
      "transcript-results-focus"
    );
  };

  const openCourseRegistrationView = () => {
    openFocusMode("course-registration-focus", coursesPanel);
  };

  const openFeePaymentView = () => {
    openFocusMode("fee-payment-focus", feePaymentPanel);
  };

  const openSemesterRegistrationView = () => {
    openFocusMode("semester-registration-focus", semesterPanel);
  };

  const openExamRegistrationView = () => {
    openFocusMode("exam-registration-focus", examPanel);
  };

  const openTranscriptResultsView = () => {
    openFocusMode("transcript-results-focus", resultsTranscriptPanel);
  };

  registerCoursesLink.addEventListener("click", (event) => {
    event.preventDefault();
    openCourseRegistrationView();
  });

  payFeesLink.addEventListener("click", (event) => {
    event.preventDefault();
    openFeePaymentView();
  });

  registerSemesterLink.addEventListener("click", (event) => {
    event.preventDefault();
    openSemesterRegistrationView();
  });

  registerExamsLink.addEventListener("click", (event) => {
    event.preventDefault();
    openExamRegistrationView();
  });

  resultsTranscriptLink.addEventListener("click", (event) => {
    event.preventDefault();
    openTranscriptResultsView();
  });

  if (studentHomeTrigger) {
    const openStudentHome = () => {
      closeFocusModes();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    studentHomeTrigger.addEventListener("click", openStudentHome);
    studentHomeTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openStudentHome();
      }
    });
  }

  menuLinks.forEach((link) => {
    if (
      link === registerCoursesLink ||
      link === payFeesLink ||
      link === registerSemesterLink ||
      link === registerExamsLink ||
      link === resultsTranscriptLink
    ) {
      return;
    }

    link.addEventListener("click", () => {
      closeFocusModes();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest(".js-exit-course-registration-view")) {
      closeFocusModes();
      document.querySelector("#student-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (target.closest(".js-exit-semester-registration-view")) {
      closeFocusModes();
      document.querySelector("#student-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (target.closest(".js-exit-fee-payment-view")) {
      closeFocusModes();
      document.querySelector("#student-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (target.closest(".js-exit-exam-registration-view")) {
      closeFocusModes();
      document.querySelector("#student-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (target.closest(".js-exit-transcript-view")) {
      closeFocusModes();
      document.querySelector("#student-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

initStudentMenuView();
initStudentPanelNavigation();
initLogoutController();
initRoleController("STUDENT");
initStudentDashboardController();
