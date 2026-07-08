/**
 * @fileoverview Controller for student exam registration workflows.
 * @module student/controllers/examRegistrationController
 */
import { registerStudentForCourseExam } from "../models/examRegistrationModel.js";
import {
  bindExamRegistrationActions,
  renderExamRegistrationPage,
  renderExamRegistrationSummary,
  setExamRegistrationMessage
} from "../views/examRegistrationView.js";

/**
 * Initializes exam registration section (dashboard summary + focused page).
 * @param {object} params - Initialization arguments.
 * @param {string} params.token - Authorization token.
 * @param {string} params.studentId - Student identifier.
 * @param {Array<object>} params.initialCourses - Registered courses with exam statuses.
 * @param {boolean} params.feeCleared - Whether student fee is cleared.
 * @param {Function} params.onStatusMessage - Dashboard-level status callback.
 * @param {Function} params.onCoursesRefresh - Refresh callback after registration.
 * @returns {object} Controller actions.
 */
export function initExamRegistrationController({
  token,
  studentId,
  initialCourses = [],
  feeCleared = false,
  onStatusMessage,
  onCoursesRefresh
}) {
  const state = {
    token: String(token || ""),
    studentId: String(studentId || ""),
    feeCleared: Boolean(feeCleared),
    courses: Array.isArray(initialCourses) ? initialCourses : []
  };

  const openExamRegistrationPage = () => {
    document.body.classList.remove(
      "course-registration-focus",
      "semester-registration-focus",
      "fee-payment-focus",
      "transcript-results-focus"
    );
    document.body.classList.add("exam-registration-focus");
    document.querySelector("#exam-registration-page")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeExamRegistrationPage = () => {
    document.body.classList.remove("exam-registration-focus");
    document.querySelector("#student-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const render = () => {
    renderExamRegistrationSummary(state.courses, { feeCleared: state.feeCleared });
    renderExamRegistrationPage(state.courses, { feeCleared: state.feeCleared });
    bindExamRegistrationActions({
      onOpenRegistrationPage: () => {
        openExamRegistrationPage();
      },
      onRegisterExam: async (courseId, courseCode) => {
        await handleRegisterExam(courseId, courseCode);
      }
    });

    const closeButton = document.querySelector(".js-exit-exam-registration-view");
    if (closeButton instanceof HTMLButtonElement) {
      closeButton.addEventListener("click", closeExamRegistrationPage);
    }
  };

  const refreshCourses = async () => {
    if (!onCoursesRefresh) {
      return state.courses;
    }

    const refreshed = await onCoursesRefresh();
    state.courses = Array.isArray(refreshed) ? refreshed : [];
    return state.courses;
  };

  const handleRegisterExam = async (courseId, courseCode) => {
    if (!state.studentId || !state.token || !courseId) {
      return;
    }

    if (!state.feeCleared) {
      setExamRegistrationMessage("Fee is not cleared. You cannot register exams yet.", "error");
      if (onStatusMessage) {
        onStatusMessage("Fee is not cleared. You cannot register exams yet.", "error");
      }
      return;
    }

    setExamRegistrationMessage(`Registering exam for ${courseCode || "selected course"}...`);
    if (onStatusMessage) {
      onStatusMessage(`Registering exam for ${courseCode || "selected course"}...`);
    }

    try {
      await registerStudentForCourseExam(state.studentId, courseId, state.token);
      await refreshCourses();
      render();
      setExamRegistrationMessage(`Exam registration completed for ${courseCode || "selected course"}.`, "success");
      if (onStatusMessage) {
        onStatusMessage(`Exam registration completed for ${courseCode || "selected course"}.`, "success");
      }
    } catch (error) {
      const message = error.message || "Failed to register exam.";
      setExamRegistrationMessage(message, "error");
      if (onStatusMessage) {
        onStatusMessage(message, "error");
      }
    }
  };

  render();

  return {
    openExamRegistrationPage,
    closeExamRegistrationPage,
    updateFeeStatus(isCleared) {
      state.feeCleared = Boolean(isCleared);
      render();
    },
    async refresh() {
      await refreshCourses();
      render();
      return state.courses;
    },
    replaceCourses(courses) {
      state.courses = Array.isArray(courses) ? courses : [];
      render();
    }
  };
}
