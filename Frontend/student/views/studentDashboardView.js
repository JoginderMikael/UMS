/**
 * @fileoverview View rendering helpers for student dashboard sections.
 * @module student/views/studentDashboardView
 */

/**
 * Renders the primary student overview panels (Student Summary and Fees Summary).
 * @param {object} summary - Dashboard summary data.
 * @param {object} summary.student - Student profile and program data.
 * @param {object|null} summary.feeStatus - current wallet balance and requirement info.
 * @param {object} summary.academic - Active year and semester metadata.
 */
export function renderStudentOverview(summary) {
  const heroSummary = document.querySelector(".js-student-hero-summary");
  const feesCard = document.querySelector(".wallet");
  if (!heroSummary || !feesCard) {
    return;
  }

  const { student = {}, feeStatus = null, academic = {} } = summary || {};
  const feeCleared = resolveFeeClearedFromSummary(feeStatus);
  heroSummary.innerHTML = `
    <h2>Student Summary</h2>
    <div class="hero-dashboard-highlights">
      <article class="hero-highlight">
        <p class="hero-highlight-label">Program</p>
        <strong>${escapeHtml(formatValue(student.programName || student.program))}</strong>
      </article>
      <article class="hero-highlight">
        <p class="hero-highlight-label">School</p>
        <strong>${escapeHtml(formatValue(student.schoolName || student.school))}</strong>
      </article>
      <article class="hero-highlight">
        <p class="hero-highlight-label">Department</p>
        <strong>${escapeHtml(formatValue(student.departmentName || student.department))}</strong>
      </article>
      <article class="hero-highlight">
        <p class="hero-highlight-label">Active Semester</p>
        <strong>${escapeHtml(formatValue(academic.activeSemesterName))}</strong>
      </article>
      <article class="hero-highlight">
        <p class="hero-highlight-label">Active Academic Year</p>
        <strong>${escapeHtml(formatValue(academic.activeAcademicYearName))}</strong>
      </article>
      <article class="hero-highlight">
        <p class="hero-highlight-label">Year of Study</p>
        <strong>${escapeHtml(formatValue(student.yearOfStudy))}</strong>
      </article>
    </div>
    <p class="form-message js-student-dashboard-message"></p>
  `;

  feesCard.innerHTML = `
    <h3>Fees Summary</h3>
    <p class="amount">${formatSignedCurrency(feeStatus?.balance)}</p>
    <span>${escapeHtml(formatValue(academic.activeSemesterName))}, ${escapeHtml(
    formatValue(academic.activeAcademicYearName)
  )}</span>
    <dl class="wallet-summary-list">
      <div><dt>Required Amount</dt><dd>${formatCurrency(feeStatus?.requiredAmount)}</dd></div>
      <div><dt>Amount Paid</dt><dd>${formatCurrency(feeStatus?.amountPaid)}</dd></div>
      <div><dt>Fee Cleared</dt><dd>${feeCleared ? "Yes" : "No"}</dd></div>
    </dl>
  `;
}

/**
 * Updates the feedback message on the student dashboard.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setStudentDashboardMessage(message, type = "") {
  const messageElement =
    document.querySelector(".js-student-dashboard-message") ||
    document.querySelector(".js-student-hero-summary .form-message");
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

/**
 * Formats a value for display, providing a fallback for empty values.
 * @param {*} value - Raw value.
 * @returns {string} Displayable string.
 */
function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

/**
 * Formats a numeric value as KES currency.
 * @param {*} amount - Numeric amount.
 * @returns {string} Formatted currency string.
 */
function formatCurrency(amount) {
  const numeric = Number(amount || 0);
  return `KES ${numeric.toLocaleString()}`;
}

/**
 * Formats a signed numeric value as KES currency (+/- semantics).
 * @param {*} amount - Numeric amount.
 * @returns {string} Formatted signed currency string.
 */
function formatSignedCurrency(amount) {
  const numeric = Number(amount || 0);
  const absoluteValue = Math.abs(numeric).toLocaleString();
  if (numeric > 0) {
    return `+KES ${absoluteValue}`;
  }
  if (numeric < 0) {
    return `-KES ${absoluteValue}`;
  }
  return "KES 0";
}

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {*} value - Raw string or value.
 * @returns {string} Escaped string.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveFeeClearedFromSummary(feeStatus) {
  const data = feeStatus && typeof feeStatus === "object" ? feeStatus : null;
  if (!data) {
    return false;
  }

  const candidates = [data.cleared, data.feeCleared, data.isCleared, data.feesCleared];
  for (const candidate of candidates) {
    if (typeof candidate === "boolean") {
      return candidate;
    }
  }

  const statusText = String(data.status || data.feeStatus || "").trim().toLowerCase();
  if (statusText) {
    if (statusText.includes("not cleared") || statusText.includes("pending") || statusText.includes("unpaid")) {
      return false;
    }
    if (statusText.includes("cleared") || statusText.includes("paid")) {
      return true;
    }
  }

  const requiredAmount = Number(data.requiredAmount);
  const amountPaid = Number(data.amountPaid);
  if (Number.isFinite(requiredAmount) && Number.isFinite(amountPaid) && requiredAmount > 0) {
    return amountPaid >= requiredAmount;
  }

  const balance = Number(data.balance);
  if (Number.isFinite(balance)) {
    return balance <= 0;
  }

  return false;
}
