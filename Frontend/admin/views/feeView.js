/**
 * @fileoverview Presentation Layer for University Fees and Financial Records.
 * Orchestrates complex financial workflows including program fee configuration,
 * student payment tracking, and fee clearance audits.
 * @module admin/views/feeView
 */
const FEE_RECORD_FIELDS = [
  { label: "Student", key: "studentName" },
  { label: "Registration", key: "registrationNumber" },
  { label: "Program", key: "programName" },
  { label: "Required Amount", key: "requiredAmount", numeric: true },
  { label: "Amount Paid", key: "amountPaid", numeric: true },
  { label: "Balance", key: "balance", numeric: true },
  { label: "Cleared", key: "cleared", boolean: true }
];

/**
 * Binds sidebar/trigger for configuring program-level fees.
 * @param {Function} onRequest - Initialization callback.
 */
export function bindSetProgramFeeTrigger(onRequest) {
  bindLinkClick(".js-configure-program-fee", onRequest);
}

/**
 * Binds triggers for recording individual student payments.
 * @param {Function} onRequest - Initialization callback.
 */
export function bindRecordFeePaymentTrigger(onRequest) {
  bindLinkClick(".js-record-fee-payment", onRequest);
}

/**
 * Binds triggers for navigating to the program fee records search.
 * @param {Function} onRequest - Navigation callback.
 */
export function bindViewProgramFeeRecordsTrigger(onRequest) {
  bindLinkClick(".js-view-program-fee-records", onRequest);
}

/**
 * Binds triggers for viewing the global fee payment history.
 * @param {Function} onRequest - Navigation callback.
 */
export function bindViewFeePaymentsTrigger(onRequest) {
  bindLinkClick(".js-view-fee-payments", onRequest);
}

/**
 * Binds triggers for the student fee clearance workflow.
 * @param {Function} onRequest - Navigation callback.
 */
export function bindClearStudentFeeTrigger(onRequest) {
  bindLinkClick(".js-clear-student-fee", onRequest);
}

/**
 * Renders the fee configuration form for academic programs.
 * @param {object} options - State for the configuration screen.
 * @param {Array<object>} options.schools - Available parent schools.
 * @param {Array<object>} options.programs - Programs within the selected school.
 * @param {Array<object>} options.academicYears - Parent years for the cycle.
 * @param {Array<object>} options.semesters - Semesters within the selected year.
 * @param {string} options.selectedSchoolId - Currently selected school.
 * @param {string} options.selectedProgramId - Currently selected program.
 * @param {string} options.selectedAcademicYearId - Currently selected year.
 * @param {string} options.selectedSemesterId - Currently selected semester.
 * @param {string|number} options.amount - Current configured amount.
 */
export function renderSetProgramFeeScreen({
  schools = [],
  programs = [],
  academicYears = [],
  semesters = [],
  selectedSchoolId = "",
  selectedProgramId = "",
  selectedAcademicYearId = "",
  selectedSemesterId = "",
  amount = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-cog"></i> Configure Program Semester Fee</h2>
      <form class="create-user-form" id="set-program-fee-form">
        <label for="fee-school-id">
          <i class="fas fa-building"></i> School
          <select id="fee-school-id" name="schoolId" class="js-fee-school-select" required>
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="fee-program-id">
          <i class="fas fa-graduation-cap"></i> Program
          <select id="fee-program-id" name="programId" class="js-fee-program-select" required>
            ${renderProgramOptions(programs, selectedProgramId)}
          </select>
        </label>
        <label for="fee-academic-year-id">
          <i class="fas fa-calendar"></i> Academic Year
          <select id="fee-academic-year-id" name="academicYearId" class="js-fee-academic-year-select" required>
            ${renderAcademicYearOptions(academicYears, selectedAcademicYearId)}
          </select>
        </label>
        <label for="fee-semester-id">
          <i class="fas fa-calendar-alt"></i> Semester
          <select id="fee-semester-id" name="semesterId" class="js-fee-semester-select" required>
            ${renderSemesterOptions(semesters, selectedSemesterId)}
          </select>
        </label>
        <label for="fee-amount">
          <i class="fas fa-dollar-sign"></i> Fee Amount
          <input type="number" id="fee-amount" name="amount" min="0" step="0.01" value="${escapeHtml(
    String(amount ?? "")
  )}" required>
        </label>
        <button type="submit" class="js-set-program-fee-submit"><i class="fas fa-save"></i> Save Program Fee</button>
      </form>
      <p class="form-message" id="fee-program-message" role="status" aria-live="polite"></p>

      <hr>
      <h3><i class="fas fa-table"></i> Configured Program Fee Records</h3>
      <p class="form-message" id="fee-program-records-message" role="status" aria-live="polite"></p>
      <div id="fee-program-records-table"></div>
    </section>`;
}

/**
 * Renders the lookup screen for viewing all fees configured for a specific program.
 * @param {object} options - State for the lookup screen.
 */
export function renderProgramFeeRecordsLookupScreen({
  schools = [],
  recordsPrograms = [],
  selectedRecordsSchoolId = "",
  selectedRecordsProgramId = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-list"></i> View Program Fee Records</h2>
      <form class="create-user-form" id="program-fee-records-form">
        <label for="fee-records-school-id">
          <i class="fas fa-building"></i> School
          <select
            id="fee-records-school-id"
            name="schoolId"
            class="js-fee-records-school-select"
            required
          >
            ${renderSchoolOptions(schools, selectedRecordsSchoolId)}
          </select>
        </label>
        <label for="fee-records-program-id">
          <i class="fas fa-graduation-cap"></i> Program
          <select
            id="fee-records-program-id"
            name="programId"
            class="js-fee-records-program-select"
            required
          >
            ${renderProgramOptions(recordsPrograms, selectedRecordsProgramId)}
          </select>
        </label>
        <button type="submit" class="js-load-program-fee-records-submit"><i class="fas fa-search"></i> Load Program Fee Records</button>
      </form>
      <p class="form-message" id="fee-program-records-message" role="status" aria-live="polite"></p>
      <div id="fee-program-records-table"></div>
    </section>`;
}

/**
 * Binds the school selection change event in the Fee Configuration form.
 * @param {Function} onChange - Callback receiving the new School ID.
 */
export function bindSetProgramFeeSchoolChange(onChange) {
  const schoolSelect = document.querySelector(".js-fee-school-select");
  if (!(schoolSelect instanceof HTMLSelectElement)) {
    return;
  }

  schoolSelect.addEventListener("change", () => {
    onChange(schoolSelect.value);
  });
}

/**
 * Binds the academic year selection change event in the Fee Configuration form.
 * @param {Function} onChange - Callback receiving the new Academic Year ID.
 */
export function bindSetProgramFeeAcademicYearChange(onChange) {
  const academicYearSelect = document.querySelector(".js-fee-academic-year-select");
  if (!(academicYearSelect instanceof HTMLSelectElement)) {
    return;
  }

  academicYearSelect.addEventListener("change", () => {
    onChange(academicYearSelect.value);
  });
}

/**
 * Binds the school selection change event in the Program Fee Records lookup.
 * @param {Function} onChange - Callback receiving the new School ID.
 */
export function bindProgramFeeRecordsSchoolChange(onChange) {
  const schoolSelect = document.querySelector(".js-fee-records-school-select");
  if (!(schoolSelect instanceof HTMLSelectElement)) {
    return;
  }

  schoolSelect.addEventListener("change", () => {
    onChange(schoolSelect.value);
  });
}

/**
 * Binds the submission of the Program Fee configuration form.
 * @param {Function} onSubmit - Callback receiving the fee payload {programId, academicYearId, semesterId, amount}.
 */
export function bindSetProgramFeeSubmit(onSubmit) {
  const form = document.querySelector("#set-program-fee-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit({
      programId: (formData.get("programId") || "").toString().trim(),
      academicYearId: (formData.get("academicYearId") || "").toString().trim(),
      semesterId: (formData.get("semesterId") || "").toString().trim(),
      amount: Number((formData.get("amount") || "0").toString())
    });
  });
}

/**
 * Updates the semester dropdown options in the Fee configuration form.
 * @param {Array<object>} semesters - Data for the new options.
 * @param {string|number} [selectedSemesterId] - ID to pre-select.
 */
export function setProgramFeeSemesterOptions(semesters, selectedSemesterId = "") {
  const semesterSelect = document.querySelector(".js-fee-semester-select");
  if (!(semesterSelect instanceof HTMLSelectElement)) {
    return;
  }

  semesterSelect.innerHTML = renderSemesterOptions(semesters, selectedSemesterId);
}

/**
 * Updates the program dropdown options in the Fee configuration form.
 * @param {Array<object>} programs - Data for the new options.
 * @param {string|number} [selectedProgramId] - ID to pre-select.
 */
export function setProgramFeeProgramOptions(programs, selectedProgramId = "") {
  const programSelect = document.querySelector(".js-fee-program-select");
  if (!(programSelect instanceof HTMLSelectElement)) {
    return;
  }

  programSelect.innerHTML = renderProgramOptions(programs, selectedProgramId);
}

/**
 * Updates the program dropdown options in the Fee Records lookup form.
 * @param {Array<object>} programs - Data for the new options.
 * @param {string|number} [selectedProgramId] - ID to pre-select.
 */
export function setProgramFeeRecordsProgramOptions(programs, selectedProgramId = "") {
  const programSelect = document.querySelector(".js-fee-records-program-select");
  if (!(programSelect instanceof HTMLSelectElement)) {
    return;
  }

  programSelect.innerHTML = renderProgramOptions(programs, selectedProgramId);
}

/**
 * Updates the feedback message for the program fee configuration form.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setProgramFeeMessage(message, type = "") {
  setMessage("#fee-program-message", message, type);
}

/**
 * Sets the loading state for the program fee configuration submit button.
 * @param {boolean} isSubmitting - Whether the request is in flight.
 */
export function setProgramFeeSubmitting(isSubmitting) {
  setButtonSubmitting(
    ".js-set-program-fee-submit",
    isSubmitting,
    "Saving...",
    "Save Program Fee"
  );
}

/**
 * Binds the submission of the program fee records lookup form.
 * @param {Function} onSubmit - Callback receiving the selected Program ID.
 */
export function bindLoadProgramFeeRecordsSubmit(onSubmit) {
  const form = document.querySelector("#program-fee-records-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit((formData.get("programId") || "").toString().trim());
  });
}

/**
 * Updates the feedback message for the program fee records lookup.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setProgramFeeRecordsMessage(message, type = "") {
  setMessage("#fee-program-records-message", message, type);
}

/**
 * Sets the loading state for the fee records lookup submit button.
 * @param {boolean} isSubmitting - Whether the request is in flight.
 */
export function setProgramFeeRecordsSubmitting(isSubmitting) {
  setButtonSubmitting(
    ".js-load-program-fee-records-submit",
    isSubmitting,
    "Loading...",
    "Load Program Fee Records"
  );
}

/**
 * Renders the tabular display of fees configured for a program.
 * @param {Array<object>} records - Collection of program fee configurations.
 */
export function renderProgramFeeRecordsTable(records = []) {
  const container = document.querySelector("#fee-program-records-table");
  if (!container) {
    return;
  }

  const rows = records
    .map((record) => `
      <tr>
        <td>${escapeHtml(formatFieldValue(record.programName))}</td>
        <td>${escapeHtml(formatFieldValue(record.academicYearName))}</td>
        <td>${escapeHtml(formatFieldValue(record.semesterName))}</td>
        <td>${escapeHtml(formatFieldValue(record.semesterNumber))}</td>
        <td>${escapeHtml(formatMoney(record.amount))}</td>
      </tr>`)
    .join("");

  container.innerHTML = `
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Program</th>
            <th>Academic Year</th>
            <th>Semester</th>
            <th>Semester No.</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5">No fee records found for selected program.</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

/**
 * Renders the screen for recording a manual student fee payment.
 * @param {object} options - State for the payment recording screen.
 * @param {Array<object>} [options.students=[]] - List of students (for selection).
 * @param {Array<object>} [options.academicYears=[]] - Available academic years.
 * @param {Array<object>} [options.semesters=[]] - Available semesters.
 * @param {string} [options.selectedStudentId=""] - Currently selected student.
 * @param {string} [options.selectedAcademicYearId=""] - Currently selected year.
 * @param {string} [options.selectedSemesterId=""] - Currently selected semester.
 * @param {string|number} [options.amount=""] - Current payment amount value.
 */
export function renderRecordFeePaymentScreen({
  students = [],
  academicYears = [],
  semesters = [],
  selectedStudentId = "",
  selectedAcademicYearId = "",
  selectedSemesterId = "",
  amount = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-money-bill"></i> Record Student Fee Payment</h2>
      <form class="create-user-form" id="fee-student-search-form">
        <label for="fee-registration-number">
          <i class="fas fa-search"></i> Search Student by Registration Number
          <input type="text" id="fee-registration-number" name="registrationNumber" placeholder="2026-CS-0001" required>
        </label>
        <label for="fee-student-id">
          Student
          <select id="fee-student-id" name="studentId" class="js-fee-student-select" required>
            ${renderStudentOptions(students, selectedStudentId)}
          </select>
        </label>
        <button type="submit" class="js-fee-student-search-submit">Search Student</button>
      </form>
      <p class="form-message" id="fee-payments-message" role="status" aria-live="polite"></p>
      <div class="created-user-result" id="fee-student-search-result" hidden></div>

      <form class="create-user-form" id="record-fee-payment-form">
        <label for="fee-payment-academic-year-id">
          Academic Year
          <select id="fee-payment-academic-year-id" name="academicYearId" class="js-fee-payment-academic-year-select" required>
            ${renderAcademicYearOptions(academicYears, selectedAcademicYearId)}
          </select>
        </label>
        <label for="fee-payment-semester-id">
          Semester
          <select id="fee-payment-semester-id" name="semesterId" class="js-fee-payment-semester-select" required>
            ${renderSemesterOptions(semesters, selectedSemesterId)}
          </select>
        </label>
        <label for="fee-payment-amount">
          Amount
          <input type="number" id="fee-payment-amount" name="amount" min="0" step="0.01" value="${escapeHtml(
    String(amount ?? "")
  )}" required>
        </label>
        <button type="submit" class="js-record-fee-payment-submit">Record Payment</button>
      </form>
      <div class="created-user-result" id="record-fee-payment-result" hidden></div>
    </section>`;
}

/**
 * Binds the academic year selection change event in the Fee Payment form.
 * @param {Function} onChange - Callback receiving the new Academic Year ID.
 */
export function bindPaymentAcademicYearChange(onChange) {
  const academicYearSelect = document.querySelector(".js-fee-payment-academic-year-select");
  if (!(academicYearSelect instanceof HTMLSelectElement)) {
    return;
  }

  academicYearSelect.addEventListener("change", () => {
    onChange(academicYearSelect.value);
  });
}

/**
 * Binds the submission of the student registration search form in the payment workflow.
 * @param {Function} onSubmit - Callback receiving the Registration Number.
 */
export function bindStudentRegistrationSearchSubmit(onSubmit) {
  const form = document.querySelector("#fee-student-search-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit((formData.get("registrationNumber") || "").toString().trim());
  });
}

/**
 * Sets the loading state for the student search submit button.
 * @param {boolean} isSubmitting - Whether the search is in flight.
 */
export function setStudentSearchSubmitting(isSubmitting) {
  setButtonSubmitting(
    ".js-fee-student-search-submit",
    isSubmitting,
    "Searching...",
    "Search Student"
  );
}

/**
 * Renders the result of a student registration search.
 * @param {object|null} student - The found student object or null.
 */
export function renderStudentSearchResult(student) {
  const container = document.querySelector("#fee-student-search-result");
  if (!container) {
    return;
  }

  if (!student || typeof student !== "object") {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const studentId = normalizeId(student.studentId || student.id || "");
  container.hidden = false;
  container.innerHTML = `
    <h3>Student Found</h3>
    <dl class="created-user-grid">
      <div class="created-user-item"><dt>Name</dt><dd>${escapeHtml(
    formatFieldValue(`${student.firstName || ""} ${student.lastName || ""}`.trim())
  )}</dd></div>
      <div class="created-user-item"><dt>Student ID</dt><dd>${escapeHtml(formatFieldValue(studentId))}</dd></div>
      <div class="created-user-item"><dt>Program</dt><dd>${escapeHtml(
    formatFieldValue(student.programName)
  )}</dd></div>
    </dl>
    <div class="user-modal-actions">
      <button type="button" class="js-select-searched-student" data-student-id="${escapeHtml(
    studentId
  )}" data-student-name="${escapeHtml(
    formatFieldValue(`${student.firstName || ""} ${student.lastName || ""}`.trim())
  )}" data-registration-number="${escapeHtml(
    formatFieldValue(student.registrationNumber)
  )}" ${studentId ? "" : "disabled"}>Use This Student</button>
    </div>`;
}

/**
 * Binds the click event on the "Use This Student" search result button.
 * @param {Function} onSelect - Callback receiving {studentId, studentName, registrationNumber}.
 */
export function bindSelectSearchedStudent(onSelect) {
  const resultContainer = document.querySelector("#fee-student-search-result");
  if (!resultContainer) {
    return;
  }

  resultContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-searched-student");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const studentId = button.dataset.studentId || "";
    const studentName = button.dataset.studentName || "";
    const registrationNumber = button.dataset.registrationNumber || "";
    if (!studentId) {
      return;
    }

    onSelect({ studentId, studentName, registrationNumber });
  });
}

/**
 * Updates the student dropdown options in the Manual Payment form.
 * @param {Array<object>} students - Data for the new options.
 * @param {string|number} [selectedStudentId] - ID to pre-select.
 */
export function setPaymentStudentOptions(students, selectedStudentId = "") {
  const studentSelect = document.querySelector(".js-fee-student-select");
  if (!(studentSelect instanceof HTMLSelectElement)) {
    return;
  }

  studentSelect.innerHTML = renderStudentOptions(students, selectedStudentId);
}

/**
 * Updates the semester dropdown options in the Manual Payment form.
 * @param {Array<object>} semesters - Data for the new options.
 * @param {string|number} [selectedSemesterId] - ID to pre-select.
 */
export function setPaymentSemesterOptions(semesters, selectedSemesterId = "") {
  const semesterSelect = document.querySelector(".js-fee-payment-semester-select");
  if (!(semesterSelect instanceof HTMLSelectElement)) {
    return;
  }

  semesterSelect.innerHTML = renderSemesterOptions(semesters, selectedSemesterId);
}

/**
 * Binds the submission of the Manual Fee Payment form.
 * @param {Function} onSubmit - Callback receiving {studentId, semesterId, amount}.
 */
export function bindRecordFeePaymentSubmit(onSubmit) {
  const form = document.querySelector("#record-fee-payment-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit({
      studentId: (formData.get("studentId") || "").toString().trim(),
      semesterId: (formData.get("semesterId") || "").toString().trim(),
      amount: Number((formData.get("amount") || "0").toString())
    });
  });
}

/**
 * Sets the loading state for the manual payment registration submit button.
 * @param {boolean} isSubmitting - Whether the request is in flight.
 */
export function setRecordPaymentSubmitting(isSubmitting) {
  setButtonSubmitting(
    ".js-record-fee-payment-submit",
    isSubmitting,
    "Recording...",
    "Record Payment"
  );
}

/**
 * Renders the confirmation/result of a manual payment registration.
 * @param {object|null} record - The newly created payment record or null.
 */
export function renderRecordedPaymentResult(record) {
  const container = document.querySelector("#record-fee-payment-result");
  if (!container) {
    return;
  }

  if (!record || typeof record !== "object") {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = renderRecordDetails(record, "Payment Recorded");
}

/**
 * Renders the comprehensive list of fee payment records with search capacity.
 * @param {Array<object>} [records=[]] - Collection of student payment statuses.
 */
export function renderFeePaymentsScreen(records = []) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = records
    .map((record) => {
      const studentId = normalizeId(record.studentId);
      const semesterId = normalizeId(record.semesterId);
      const canComplete = !Boolean(record.cleared) && studentId && semesterId;
      return `
        <tr>
          <td>${escapeHtml(formatFieldValue(record.registrationNumber))}</td>
          <td>${escapeHtml(formatFieldValue(record.studentName))}</td>
          <td>${escapeHtml(formatFieldValue(record.programName))}</td>
          <td>${escapeHtml(formatMoney(record.requiredAmount))}</td>
          <td>${escapeHtml(formatMoney(record.amountPaid))}</td>
          <td>${escapeHtml(formatMoney(record.balance))}</td>
          <td>${renderClearBadge(record.cleared)}</td>
          <td>
            <button
              type="button"
              class="row-action js-complete-fee-payment"
              data-student-id="${escapeHtml(studentId)}"
              data-semester-id="${escapeHtml(semesterId)}"
              ${canComplete ? "" : "disabled"}
            >Complete Payment</button>
          </td>
        </tr>`;
    })
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-money-bill"></i> Fee Payment Records</h2>
      <div class="users-search">
        <input type="text" class="js-fee-payments-search" placeholder="Search by registration number or student name">
        <button type="button" class="js-fee-payments-search-btn">Search</button>
      </div>
      <p class="form-message" id="fee-payments-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Registration #</th>
              <th>Student</th>
              <th>Program</th>
              <th>Required</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Cleared</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-fee-payments-table-body">
            ${rows || '<tr><td colspan="8">No fee payment records found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Binds the search trigger for the fee payments catalog.
 * @param {Function} onSearch - Callback receiving the search query string.
 */
export function bindFeePaymentsSearch(onSearch) {
  const searchInput = document.querySelector(".js-fee-payments-search");
  const searchButton = document.querySelector(".js-fee-payments-search-btn");
  if (!(searchInput instanceof HTMLInputElement) || !(searchButton instanceof HTMLButtonElement)) {
    return;
  }

  const submit = () => {
    onSearch(searchInput.value.trim());
  };

  searchButton.addEventListener("click", submit);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  });
}

/**
 * Binds the "Complete Payment" row action in the fee payments table.
 * @param {Function} onAction - Callback receiving {studentId, semesterId}.
 */
export function bindCompleteFeePaymentAction(onAction) {
  const tableBody = document.querySelector(".js-fee-payments-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-complete-fee-payment");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const studentId = button.dataset.studentId || "";
    const semesterId = button.dataset.semesterId || "";
    if (!studentId || !semesterId) {
      return;
    }

    onAction({ studentId, semesterId });
  });
}

/**
 * Sets set fee payments message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setFeePaymentsMessage(message, type = "") {
  setMessage("#fee-payments-message", message, type);
}

/**
 * Renders render clear student fee screen.
 * @returns {void}
 */
export function renderClearStudentFeeScreen({
  students = [],
  academicYears = [],
  semesters = [],
  selectedStudentId = "",
  selectedAcademicYearId = "",
  selectedSemesterId = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-eraser"></i> Clear Student Fee</h2>
      <form class="create-user-form" id="clear-fee-search-student-form">
        <label for="clear-fee-registration-number">
          Search Student by Registration Number
          <input type="text" id="clear-fee-registration-number" name="registrationNumber" placeholder="2026-CS-0001" required>
        </label>
        <button type="submit" class="js-clear-fee-search-submit">Search Student</button>
      </form>

      <form class="create-user-form" id="clear-fee-status-form">
        <label for="clear-fee-student-id">
          Student
          <select id="clear-fee-student-id" name="studentId" class="js-clear-fee-student-select" required>
            ${renderStudentOptions(students, selectedStudentId)}
          </select>
        </label>
        <label for="clear-fee-academic-year-id">
          Academic Year
          <select id="clear-fee-academic-year-id" name="academicYearId" class="js-clear-fee-academic-year-select" required>
            ${renderAcademicYearOptions(academicYears, selectedAcademicYearId)}
          </select>
        </label>
        <label for="clear-fee-semester-id">
          Semester
          <select id="clear-fee-semester-id" name="semesterId" class="js-clear-fee-semester-select" required>
            ${renderSemesterOptions(semesters, selectedSemesterId)}
          </select>
        </label>
        <button type="submit" class="js-load-fee-status-submit">Load Fee Status</button>
      </form>

      <p class="form-message" id="clear-fee-message" role="status" aria-live="polite"></p>
      <div class="created-user-result" id="clear-fee-student-result" hidden></div>
      <div class="created-user-result" id="clear-fee-status-result" hidden></div>
    </section>`;
}

/**
 * Binds bind clear fee academic year change.
 * @param {*} onChange
 * @returns {void}
 */
export function bindClearFeeAcademicYearChange(onChange) {
  const academicYearSelect = document.querySelector(".js-clear-fee-academic-year-select");
  if (!(academicYearSelect instanceof HTMLSelectElement)) {
    return;
  }

  academicYearSelect.addEventListener("change", () => onChange(academicYearSelect.value));
}

/**
 * Binds bind clear fee search submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindClearFeeSearchSubmit(onSubmit) {
  const form = document.querySelector("#clear-fee-search-student-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit((formData.get("registrationNumber") || "").toString().trim());
  });
}

/**
 * Sets set clear fee search submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setClearFeeSearchSubmitting(isSubmitting) {
  setButtonSubmitting(
    ".js-clear-fee-search-submit",
    isSubmitting,
    "Searching...",
    "Search Student"
  );
}

/**
 * Renders render clear fee student result.
 * @param {*} student
 * @returns {void}
 */
export function renderClearFeeStudentResult(student) {
  const container = document.querySelector("#clear-fee-student-result");
  if (!container) {
    return;
  }

  if (!student || typeof student !== "object") {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const studentId = normalizeId(student.studentId || student.id || "");
  const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim();

  container.hidden = false;
  container.innerHTML = `
    <h3>Student Found</h3>
    <dl class="created-user-grid">
      <div class="created-user-item"><dt>Name</dt><dd>${escapeHtml(formatFieldValue(studentName))}</dd></div>
      <div class="created-user-item"><dt>Student ID</dt><dd>${escapeHtml(formatFieldValue(studentId))}</dd></div>
      <div class="created-user-item"><dt>Program</dt><dd>${escapeHtml(
    formatFieldValue(student.programName)
  )}</dd></div>
    </dl>
    <div class="user-modal-actions">
      <button type="button" class="js-select-clear-fee-student" data-student-id="${escapeHtml(
    studentId
  )}" data-student-name="${escapeHtml(formatFieldValue(studentName))}" data-registration-number="${escapeHtml(
    formatFieldValue(student.registrationNumber)
  )}" ${studentId ? "" : "disabled"}>Use This Student</button>
    </div>`;
}

/**
 * Binds bind select clear fee student.
 * @param {*} onSelect
 * @returns {void}
 */
export function bindSelectClearFeeStudent(onSelect) {
  const resultContainer = document.querySelector("#clear-fee-student-result");
  if (!resultContainer) {
    return;
  }

  resultContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-clear-fee-student");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const studentId = button.dataset.studentId || "";
    const studentName = button.dataset.studentName || "";
    const registrationNumber = button.dataset.registrationNumber || "";
    if (!studentId) {
      return;
    }

    onSelect({ studentId, studentName, registrationNumber });
  });
}

/**
 * Sets set clear fee student options.
 * @param {Array<*>} students
 * @param {string|number} selectedStudentId
 * @returns {void}
 */
export function setClearFeeStudentOptions(students, selectedStudentId = "") {
  const studentSelect = document.querySelector(".js-clear-fee-student-select");
  if (!(studentSelect instanceof HTMLSelectElement)) {
    return;
  }

  studentSelect.innerHTML = renderStudentOptions(students, selectedStudentId);
}

/**
 * Sets set clear fee semester options.
 * @param {Array<*>} semesters
 * @param {string|number} selectedSemesterId
 * @returns {void}
 */
export function setClearFeeSemesterOptions(semesters, selectedSemesterId = "") {
  const semesterSelect = document.querySelector(".js-clear-fee-semester-select");
  if (!(semesterSelect instanceof HTMLSelectElement)) {
    return;
  }

  semesterSelect.innerHTML = renderSemesterOptions(semesters, selectedSemesterId);
}

/**
 * Binds bind load fee status submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindLoadFeeStatusSubmit(onSubmit) {
  const form = document.querySelector("#clear-fee-status-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit({
      studentId: (formData.get("studentId") || "").toString().trim(),
      semesterId: (formData.get("semesterId") || "").toString().trim()
    });
  });
}

/**
 * Sets set load fee status submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setLoadFeeStatusSubmitting(isSubmitting) {
  setButtonSubmitting(
    ".js-load-fee-status-submit",
    isSubmitting,
    "Loading...",
    "Load Fee Status"
  );
}

/**
 * Renders render fee status result.
 * @param {*} statusRecord
 * @returns {void}
 */
export function renderFeeStatusResult(statusRecord) {
  const container = document.querySelector("#clear-fee-status-result");
  if (!container) {
    return;
  }

  if (!statusRecord || typeof statusRecord !== "object") {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const studentId = normalizeId(statusRecord.studentId);
  const semesterId = normalizeId(statusRecord.semesterId);
  const canClear = !Boolean(statusRecord.cleared) && studentId && semesterId;

  container.hidden = false;
  container.innerHTML = `
    ${renderRecordDetails(statusRecord, "Fee Status")}
    <div class="user-modal-actions">
      <button
        type="button"
        class="js-clear-fee-submit"
        data-student-id="${escapeHtml(studentId)}"
        data-semester-id="${escapeHtml(semesterId)}"
        ${canClear ? "" : "disabled"}
      >Clear Student Fee</button>
    </div>`;
}

/**
 * Binds bind clear student fee submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindClearStudentFeeSubmit(onSubmit) {
  const container = document.querySelector("#clear-fee-status-result");
  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-clear-fee-submit");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const studentId = button.dataset.studentId || "";
    const semesterId = button.dataset.semesterId || "";
    if (!studentId || !semesterId) {
      return;
    }

    onSubmit({ studentId, semesterId });
  });
}

/**
 * Sets set clear fee action submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setClearFeeActionSubmitting(isSubmitting) {
  setButtonSubmitting(
    ".js-clear-fee-submit",
    isSubmitting,
    "Clearing...",
    "Clear Student Fee"
  );
}

/**
 * Sets set clear fee message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setClearFeeMessage(message, type = "") {
  setMessage("#clear-fee-message", message, type);
}

/**
 * Formats a record's details into a summary list for modal/profile view.
 * @param {object} record - Data record to render.
 * @param {string} title - Header text for the summary.
 * @returns {string} HTML string of the record details.
 */
function renderRecordDetails(record, title) {
  return `
    <h3>${escapeHtml(title)}</h3>
    <dl class="created-user-grid">
      ${FEE_RECORD_FIELDS.map((field) => {
    const rawValue = record[field.key];
    const value = field.numeric
      ? formatMoney(rawValue)
      : field.boolean
        ? rawValue
          ? "Yes"
          : "No"
        : formatFieldValue(rawValue);
    return `<div class="created-user-item"><dt>${escapeHtml(field.label)}</dt><dd>${escapeHtml(
      value
    )}</dd></div>`;
  }).join("")}
    </dl>`;
}

/**
 * Renders HTML option elements for academic programs.
 * @param {Array<object>} programs - Collection of program objects.
 * @param {string|number} [selectedProgramId] - ID of the program to pre-select.
 * @returns {string} HTML string of option elements.
 */
function renderProgramOptions(programs, selectedProgramId = "") {
  if (!Array.isArray(programs) || programs.length === 0) {
    return `<option value="">No programs available</option>`;
  }

  const options = programs
    .map((program) => {
      const id = normalizeId(program.id || program.programId);
      const name = formatFieldValue(program.name || program.programName);
      const code = formatFieldValue(program.code || program.programCode);
      const selected = id && String(id) === String(selectedProgramId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select Program</option>${options}`;
}

/**
 * Renders HTML option elements for university schools.
 * @param {Array<object>} schools - Collection of school objects.
 * @param {string|number} [selectedSchoolId] - ID of the school to pre-select.
 * @returns {string} HTML string of option elements.
 */
function renderSchoolOptions(schools, selectedSchoolId = "") {
  if (!Array.isArray(schools) || schools.length === 0) {
    return `<option value="">No schools available</option>`;
  }

  const options = schools
    .map((school) => {
      const id = normalizeId(school.id || school.schoolId);
      const name = formatFieldValue(school.name || school.schoolName);
      const code = formatFieldValue(school.code || school.schoolCode);
      const selected = id && String(id) === String(selectedSchoolId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select School</option>${options}`;
}

/**
 * Renders HTML option elements for academic years.
 * @param {Array<object>} academicYears - Collection of year objects.
 * @param {string|number} [selectedAcademicYearId] - ID of the year to pre-select.
 * @returns {string} HTML string of option elements.
 */
function renderAcademicYearOptions(academicYears, selectedAcademicYearId = "") {
  if (!Array.isArray(academicYears) || academicYears.length === 0) {
    return `<option value="">No academic years available</option>`;
  }

  const options = academicYears
    .map((academicYear) => {
      const id = normalizeId(academicYear.academicYearId || academicYear.id);
      const name = formatFieldValue(academicYear.name || academicYear.academicYearName);
      const activityTag = academicYear.active ? " - Active" : " - Inactive";
      const selected = id && String(id) === String(selectedAcademicYearId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name}${activityTag}`)}</option>`;
    })
    .join("");

  return `<option value="">Select Academic Year</option>${options}`;
}

/**
 * Renders HTML option elements for program semesters.
 * @param {Array<object>} semesters - Collection of semester objects.
 * @param {string|number} [selectedSemesterId] - ID of the semester to pre-select.
 * @returns {string} HTML string of option elements.
 */
function renderSemesterOptions(semesters, selectedSemesterId = "") {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return `<option value="">No semesters available</option>`;
  }

  const options = semesters
    .map((semester) => {
      const id = normalizeId(semester.semesterId || semester.id);
      const name = formatFieldValue(semester.name);
      const number = semester.number === null || semester.number === undefined ? "" : semester.number;
      const activityTag = semester.active ? " - Active" : " - Inactive";
      const label = number === "" ? `${name}${activityTag}` : `${name} (No. ${number})${activityTag}`;
      const selected = id && String(id) === String(selectedSemesterId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(label)}</option>`;
    })
    .join("");

  return `<option value="">Select Semester</option>${options}`;
}

/**
 * Renders HTML option elements for student selection.
 * @param {Array<object>} students - Collection of student objects.
 * @param {string|number} [selectedStudentId] - ID of the student to pre-select.
 * @returns {string} HTML string of option elements.
 */
function renderStudentOptions(students, selectedStudentId = "") {
  if (!Array.isArray(students) || students.length === 0) {
    return `<option value="">No students available. Search by registration number first.</option>`;
  }

  const options = students
    .map((student) => {
      const studentId = normalizeId(student.studentId || student.id);
      const registrationNumber = formatFieldValue(student.registrationNumber);
      const studentName = formatFieldValue(student.studentName || student.fullName);
      const selected = studentId && String(studentId) === String(selectedStudentId) ? "selected" : "";
      return `<option value="${escapeHtml(studentId)}" ${selected}>${escapeHtml(
        `${registrationNumber} - ${studentName}`
      )}</option>`;
    })
    .join("");

  return `<option value="">Select Student</option>${options}`;
}

/**
 * Renders a visual badge indicating the fee clearance status.
 * @param {boolean} cleared - Whether the fee is cleared.
 * @returns {string} HTML string for the status badge.
 */
function renderClearBadge(cleared) {
  const status = cleared ? "Cleared" : "Pending";
  const className = cleared ? "fee-status-badge cleared" : "fee-status-badge pending";
  return `<span class="${className}">${escapeHtml(status)}</span>`;
}

/**
 * Internal helper to update feedback messages in the UI.
 * @param {string} selector - CSS selector for the target element.
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
function setMessage(selector, message, type = "") {
  const messageElement = document.querySelector(selector);
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Internal helper to set loading state on action buttons.
 * @param {string} selector - CSS selector for the target button.
 * @param {boolean} isSubmitting - Whether a request is active.
 * @param {string} submittingText - Label to show while loading.
 * @param {string} defaultText - Original button label.
 */
function setButtonSubmitting(selector, isSubmitting, submittingText, defaultText) {
  const button = document.querySelector(selector);
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? submittingText : defaultText;
}

/**
 * Internal helper to bind generic click handlers to link elements.
 * @param {string} selector - CSS selector for target links.
 * @param {Function} onRequest - Event handler callback.
 */
function bindLinkClick(selector, onRequest) {
  const links = document.querySelectorAll(selector);
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onRequest();
    });
  });
}

/**
 * Formats a raw value for consistent UI display.
 * @param {any} value - The input value.
 * @returns {string} Formatted string (defaults to "N/A" if empty).
 */
function formatFieldValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

/**
 * Formats a numeric value as a currency/monetary string.
 * @param {number|string} value - The numerical value.
 * @returns {string} Formatted monetary string.
 */
function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Normalizes an identifier (ID) to a consistent string format.
 * @param {any} value - Raw identifier.
 * @returns {string} Sanitized ID string.
 */
function normalizeId(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {any} value - Raw input.
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

/**
 * Toggles the visibility of the main hero section.
 * @param {boolean} isVisible - True to show, false to hide.
 */
function setHeroVisibility(isVisible) {
  const heroSection = document.querySelector(".hero");
  if (!heroSection) {
    return;
  }

  heroSection.hidden = !isVisible;
}
