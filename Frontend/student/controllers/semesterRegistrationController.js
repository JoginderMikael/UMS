/**
 * @fileoverview Controller for student semester registration workflows.
 * @module student/controllers/semesterRegistrationController
 */
import { enrollStudentInCurrentSemester } from "../models/semesterRegistrationModel.js";
import {
  bindSemesterRegistrationActions,
  renderSemesterRegistrationPanel,
  setSemesterRegistrationMessage
} from "../views/semesterRegistrationView.js";

/**
 * Initializes semester registration section.
 * @param {object} params - Initialization arguments.
 * @param {string} params.token - Authorization token.
 * @param {string} params.studentId - Student identifier.
 * @param {object} params.academicContext - Active semester/year details.
 * @param {Function} params.onStatusMessage - Dashboard-level status callback.
 */
export function initSemesterRegistrationController({
  token,
  studentId,
  academicContext,
  onStatusMessage
}) {
  renderSemesterRegistrationPanel({
    activeSemesterName: academicContext?.activeSemesterName || "N/A",
    activeAcademicYearName: academicContext?.activeAcademicYearName || "N/A",
    studentId
  });

  bindSemesterRegistrationActions({
    onRegisterSemester: async () => {
      if (!studentId) {
        setSemesterRegistrationMessage("Student ID not found for semester registration.", "error");
        if (onStatusMessage) {
          onStatusMessage("Student ID not found for semester registration.", "error");
        }
        return;
      }

      setSemesterRegistrationMessage("Registering semester...");
      try {
        await enrollStudentInCurrentSemester(studentId, token);
        setSemesterRegistrationMessage("Semester registered successfully.", "success");
        if (onStatusMessage) {
          onStatusMessage("Semester registration successful.", "success");
        }
      } catch (error) {
        const message = error.message || "Failed to register semester.";
        setSemesterRegistrationMessage(message, "error");
        if (onStatusMessage) {
          onStatusMessage(message, "error");
        }
      }
    }
  });
}

