/**
 * @fileoverview Controller for student fee payment workflows.
 * @module student/controllers/feePaymentController
 */
import { payStudentFees } from "../models/feePaymentModel.js";
import {
  bindFeePaymentActions,
  renderFeePaymentPage,
  setFeePaymentMessage
} from "../views/feePaymentView.js";

/**
 * Initializes fee payment page and interactions.
 * @param {object} params - Initialization arguments.
 * @param {string} params.token - Authorization token.
 * @param {string} params.studentId - Student identifier.
 * @param {string} params.semesterId - Active semester identifier.
 * @param {object} params.academicContext - Academic year/semester labels.
 * @param {object|null} params.initialFeeStatus - Initial fee status.
 * @param {Function} params.onStatusMessage - Dashboard-level status callback.
 * @param {Function} params.onFeeStatusRefresh - Callback after successful payment.
 * @returns {object} Controller actions.
 */
export function initFeePaymentController({
  token,
  studentId,
  semesterId,
  academicContext,
  initialFeeStatus = null,
  onStatusMessage,
  onFeeStatusRefresh
}) {
  const state = {
    token: String(token || ""),
    studentId: String(studentId || ""),
    semesterId: String(semesterId || ""),
    academicContext: academicContext && typeof academicContext === "object" ? academicContext : {},
    feeStatus: initialFeeStatus && typeof initialFeeStatus === "object" ? initialFeeStatus : null,
    lastPaymentResponse: null,
    showPaymentResponseModal: false
  };

  const render = () => {
    renderFeePaymentPage({
      feeStatus: state.feeStatus,
      academic: state.academicContext,
      lastPaymentResponse: state.lastPaymentResponse,
      showPaymentResponseModal: state.showPaymentResponseModal
    });

    bindFeePaymentActions({
      onSubmitPayment: async (amount) => {
        await submitPayment(amount);
      },
      onCloseResponseModal: () => {
        state.showPaymentResponseModal = false;
        render();
      }
    });
  };

  const submitPayment = async (amount) => {
    if (!state.token || !state.studentId || !state.semesterId) {
      setFeePaymentMessage("Unable to process payment: missing student/semester context.", "error");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFeePaymentMessage("Enter a valid amount greater than 0.", "error");
      return;
    }

    setFeePaymentMessage("Submitting fee payment...");
    if (onStatusMessage) {
      onStatusMessage("Submitting fee payment...");
    }

    try {
      const response = await payStudentFees(state.studentId, state.semesterId, amount, state.token);
      state.lastPaymentResponse = response && typeof response === "object" ? response : { amount };
      state.showPaymentResponseModal = true;

      if (onFeeStatusRefresh) {
        const refreshed = await onFeeStatusRefresh();
        if (refreshed && typeof refreshed === "object") {
          state.feeStatus = refreshed;
        }
      }

      render();
      setFeePaymentMessage("Fee payment recorded successfully.", "success");
      if (onStatusMessage) {
        onStatusMessage("Fee payment recorded successfully.", "success");
      }
    } catch (error) {
      const message = error.message || "Failed to submit fee payment.";
      setFeePaymentMessage(message, "error");
      if (onStatusMessage) {
        onStatusMessage(message, "error");
      }
    }
  };

  render();

  return {
    replaceFeeStatus(feeStatus) {
      state.feeStatus = feeStatus && typeof feeStatus === "object" ? feeStatus : null;
      render();
    }
  };
}
