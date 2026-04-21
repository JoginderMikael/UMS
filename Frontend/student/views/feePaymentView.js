/**
 * @fileoverview View rendering helpers for student fee payment workflows.
 * @module student/views/feePaymentView
 */

/**
 * Renders the focused fee payment page.
 * @param {object} data - Rendering data.
 * @param {object|null} data.feeStatus - Current fee status.
 * @param {object} data.academic - Academic context (semester/year).
 * @param {object|null} data.lastPaymentResponse - Last payment API response.
 */
export function renderFeePaymentPage({
  feeStatus = null,
  academic = {},
  lastPaymentResponse = null,
  showPaymentResponseModal = false
} = {}) {
  const panel = document.querySelector("#fee-payment-page");
  if (!panel) {
    return;
  }
  const requiredAmount = Number(feeStatus?.requiredAmount || 0);
  const amountPaid = Number(feeStatus?.amountPaid || 0);
  const balance = Number(feeStatus?.balance || 0);
  const feeCleared = resolveFeeCleared(feeStatus);

  panel.innerHTML = `
    <h2>Pay Fees</h2>
    <div class="course-registration-actions">
      <button type="button" class="ghost js-exit-fee-payment-view">Back To Dashboard</button>
    </div>
    <section class="stack fee-status-summary-section" aria-label="Current fee status">
      <h3>Current Fee Status</h3>
      <div class="fee-status-container">
        <div class="fee-status-cards">
          <article class="fee-status-card">
            <p class="fee-status-label">Required Amount</p>
            <strong>${escapeHtml(formatCurrency(requiredAmount))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Amount Paid</p>
            <strong>${escapeHtml(formatCurrency(amountPaid))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Balance</p>
            <strong>${escapeHtml(formatCurrency(balance))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Fee Cleared</p>
            <strong class="${feeCleared ? "fee-state-cleared" : "fee-state-pending"}">${feeCleared ? "Yes" : "No"}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Semester</p>
            <strong>${escapeHtml(formatValue(academic.activeSemesterName))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Academic Year</p>
            <strong>${escapeHtml(formatValue(academic.activeAcademicYearName))}</strong>
          </article>
        </div>
      </div>
    </section>
    <section class="stack fee-payment-form-container" aria-label="Submit fee payment">
      <p class="form-message js-fee-payment-message">Enter amount paid, then submit.</p>
      <form class="fee-payment-form js-fee-payment-form" novalidate>
        <label for="fee-payment-amount">Amount Paid (KES)</label>
        <div class="fee-payment-form-row">
          <input
            id="fee-payment-amount"
            name="amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 5000"
            required
          >
          <button type="submit">Submit Payment</button>
        </div>
      </form>
    </section>
    ${renderPaymentResponseModal(lastPaymentResponse, showPaymentResponseModal)}
  `;
}

/**
 * Binds fee payment form actions.
 * @param {object} callbacks - Event callbacks.
 * @param {Function} callbacks.onSubmitPayment - Invoked with numeric amount.
 */
export function bindFeePaymentActions({ onSubmitPayment, onCloseResponseModal }) {
  const form = document.querySelector(".js-fee-payment-form");
  if (!(form instanceof HTMLFormElement)) {
    // Continue to allow modal close binding even if form is absent.
  } else {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const amountInput = form.querySelector('input[name="amount"]');
      if (!(amountInput instanceof HTMLInputElement)) {
        return;
      }

      const amount = Number(amountInput.value);
      onSubmitPayment(amount);
    });
  }

  const closeButton = document.querySelector(".js-close-fee-payment-response");
  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", () => {
      if (typeof onCloseResponseModal === "function") {
        onCloseResponseModal();
      }
    });
  }

  const modalBackdrop = document.querySelector(".js-fee-payment-response-modal");
  if (modalBackdrop instanceof HTMLDivElement) {
    modalBackdrop.addEventListener("click", (event) => {
      if (event.target !== modalBackdrop) {
        return;
      }
      if (typeof onCloseResponseModal === "function") {
        onCloseResponseModal();
      }
    });
  }
}

/**
 * Updates fee payment status message.
 * @param {string} message - Message text.
 * @param {string} [type] - Optional contextual class ('success' | 'error').
 */
export function setFeePaymentMessage(message, type = "") {
  const messageElement = document.querySelector(".js-fee-payment-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-error", "is-success");
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
}

function renderPaymentResponseModal(payload, isVisible) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const response = normalizePaymentResponse(payload);
  return `
    <div class="fee-payment-response-modal js-fee-payment-response-modal ${isVisible ? "is-visible" : ""}" role="dialog" aria-modal="true" aria-label="Fee payment response">
      <div class="fee-payment-response-dialog">
        <div class="fee-payment-response-header">
          <h3>Payment Recorded</h3>
          <button type="button" class="ghost js-close-fee-payment-response">Close</button>
        </div>
        <div class="fee-status-cards">
          <article class="fee-status-card">
            <p class="fee-status-label">Student Name</p>
            <strong>${escapeHtml(formatValue(response.studentName))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Registration Number</p>
            <strong>${escapeHtml(formatValue(response.registrationNumber))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Program</p>
            <strong>${escapeHtml(formatValue(response.programName))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Fee Cleared</p>
            <strong class="${response.cleared ? "fee-state-cleared" : "fee-state-pending"}">${response.cleared ? "Yes" : "No"}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Required Amount</p>
            <strong>${escapeHtml(formatCurrency(response.requiredAmount))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Amount Paid</p>
            <strong>${escapeHtml(formatCurrency(response.amountPaid))}</strong>
          </article>
          <article class="fee-status-card">
            <p class="fee-status-label">Balance</p>
            <strong>${escapeHtml(formatCurrency(response.balance))}</strong>
          </article>
        </div>
      </div>
    </div>
  `;
}

function normalizePaymentResponse(payload) {
  const data = payload && typeof payload === "object" ? payload : {};
  return {
    studentId: String(data.studentId || ""),
    registrationNumber: String(data.registrationNumber || ""),
    studentName: String(data.studentName || ""),
    programId: String(data.programId || ""),
    programName: String(data.programName || ""),
    semesterId: String(data.semesterId || ""),
    academicYearId: String(data.academicYearId || ""),
    requiredAmount: Number(data.requiredAmount || 0),
    amountPaid: Number(data.amountPaid || 0),
    balance: Number(data.balance || 0),
    cleared: Boolean(data.cleared)
  };
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return String(value);
}

function formatCurrency(amount) {
  const numeric = Number(amount || 0);
  return `KES ${numeric.toLocaleString()}`;
}

function resolveFeeCleared(feeStatus) {
  const data = feeStatus && typeof feeStatus === "object" ? feeStatus : null;
  if (!data) {
    return false;
  }

  const direct = [data.cleared, data.feeCleared, data.isCleared, data.feesCleared];
  for (const value of direct) {
    if (typeof value === "boolean") {
      return value;
    }
  }

  const balance = Number(data.balance);
  if (Number.isFinite(balance)) {
    return balance <= 0;
  }

  const required = Number(data.requiredAmount);
  const paid = Number(data.amountPaid);
  if (Number.isFinite(required) && Number.isFinite(paid) && required > 0) {
    return paid >= required;
  }

  return false;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
