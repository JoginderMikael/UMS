/**
 * @fileoverview Administrative controller for managing University Fees.
 * Handles program-level fee configuration, student payment records,
 * payment clearance workflows, and fee status tracking.
 * @module admin/controllers/feeController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import {
  fetchAllProgramsMinimal,
  fetchAllSchoolsForPrograms,
  fetchProgramsBySchool
} from "../models/programModel.js";
import { fetchAllAcademicYears, fetchSemestersByAcademicYear } from "../models/academicYearModel.js";
import {
  clearStudentSemesterFee,
  fetchFeePaymentRecords,
  fetchProgramFeeRecords,
  fetchStudentDetailsByRegistrationNumber,
  fetchStudentSemesterFeeStatus,
  recordStudentFeePayment,
  setProgramSemesterFee
} from "../models/feeModel.js";
import {
  bindClearFeeAcademicYearChange,
  bindClearFeeSearchSubmit,
  bindClearStudentFeeSubmit,
  bindClearStudentFeeTrigger,
  bindCompleteFeePaymentAction,
  bindFeePaymentsSearch,
  bindLoadFeeStatusSubmit,
  bindLoadProgramFeeRecordsSubmit,
  bindPaymentAcademicYearChange,
  bindProgramFeeRecordsSchoolChange,
  bindRecordFeePaymentSubmit,
  bindRecordFeePaymentTrigger,
  bindSelectClearFeeStudent,
  bindSelectSearchedStudent,
  bindSetProgramFeeSchoolChange,
  bindSetProgramFeeAcademicYearChange,
  bindSetProgramFeeSubmit,
  bindSetProgramFeeTrigger,
  bindStudentRegistrationSearchSubmit,
  bindViewProgramFeeRecordsTrigger,
  bindViewFeePaymentsTrigger,
  renderClearFeeStudentResult,
  renderClearStudentFeeScreen,
  renderFeePaymentsScreen,
  renderFeeStatusResult,
  renderProgramFeeRecordsLookupScreen,
  renderProgramFeeRecordsTable,
  renderRecordFeePaymentScreen,
  renderRecordedPaymentResult,
  renderSetProgramFeeScreen,
  setClearFeeActionSubmitting,
  setClearFeeMessage,
  setClearFeeSearchSubmitting,
  setClearFeeSemesterOptions,
  setClearFeeStudentOptions,
  setFeePaymentsMessage,
  setLoadFeeStatusSubmitting,
  setPaymentSemesterOptions,
  setPaymentStudentOptions,
  setProgramFeeProgramOptions,
  setProgramFeeRecordsMessage,
  setProgramFeeRecordsProgramOptions,
  setProgramFeeRecordsSubmitting,
  setProgramFeeMessage,
  setProgramFeeSemesterOptions,
  setProgramFeeSubmitting,
  setRecordPaymentSubmitting,
  setStudentSearchSubmitting,
  renderStudentSearchResult
} from "../views/feeView.js";

let programs = [];
let schools = [];
let academicYears = [];
const semestersByAcademicYearId = new Map();
const programsBySchoolId = new Map();
let feePaymentRecords = [];
let currentPaymentRecords = [];
let availableStudents = [];
let selectedPaymentAcademicYearId = "";
let selectedClearAcademicYearId = "";
let selectedSchoolIdForProgramFee = "";
let selectedRecordsSchoolId = "";
let recordsPrograms = [];
let currentFeeStatus = null;

/**
 * Initializes the fee controller by establishing primary UI triggers.
 * Sets up listeners for program fee configuration, records lookup, payment recording, and clearance.
 * @returns {void} No return value.
 */
export function initFeeController() {
  bindSetProgramFeeTrigger(handleSetProgramFeeRequested);
  bindViewProgramFeeRecordsTrigger(handleViewProgramFeeRecordsRequested);
  bindRecordFeePaymentTrigger(handleRecordFeePaymentRequested);
  bindViewFeePaymentsTrigger(handleViewFeePaymentsRequested);
  bindClearStudentFeeTrigger(handleClearStudentFeeRequested);
}

/**
 * Initiates the 'Set Program Fee' configuration experience.
 * Orchestrates the loading of prerequisite context (Schools, Programs, Academic Years).
 * @returns {Promise<void>} Resolves when the fee configuration form is rendered.
 */
async function handleSetProgramFeeRequested() {
  const token = loadToken();
  if (!token) {
    renderSetProgramFeeScreen();
    setProgramFeeMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderSetProgramFeeScreen();
  renderProgramFeeRecordsTable([]);
  setProgramFeeRecordsMessage("");
  setProgramFeeMessage("Loading programs and academic years...");

  try {
    const [schoolsResponse, yearsResponse] = await Promise.all([
      fetchAllSchoolsForPrograms(token),
      fetchAllAcademicYears(token)
    ]);

    schools = normalizeCollection(schoolsResponse).map(normalizeSchool);
    academicYears = normalizeCollection(yearsResponse).map(normalizeAcademicYear);
    selectedSchoolIdForProgramFee = schools[0]?.schoolId || "";
    programs = selectedSchoolIdForProgramFee
      ? await loadProgramsBySchool(selectedSchoolIdForProgramFee, token)
      : [];

    const selectedAcademicYearId = academicYears[0]?.academicYearId || "";
    const semesters = selectedAcademicYearId
      ? await loadSemestersByAcademicYear(selectedAcademicYearId, token)
      : [];

    renderSetProgramFeeScreen({
      schools,
      programs,
      academicYears,
      selectedSchoolId: selectedSchoolIdForProgramFee,
      semesters,
      selectedProgramId: programs[0]?.programId || "",
      selectedAcademicYearId,
      selectedSemesterId: semesters[0]?.semesterId || ""
    });

    bindSetProgramFeeEvents();
    setProgramFeeMessage("Select program, academic year, semester, and amount.");
    setProgramFeeRecordsMessage("Configured records for the updated program will appear here.");
  } catch (error) {
    renderSetProgramFeeScreen({
      schools: [],
      programs: [],
      academicYears: [],
      semesters: []
    });
    bindSetProgramFeeEvents();
    setProgramFeeMessage(error.message || "Failed to load fee setup context.", "error");
    setProgramFeeRecordsMessage("");
  }
}

/**
 * Transitions the UI to the Program Fee Records Audit view.
 * Prepares the environment by loading school and program lookup lists.
 * @returns {Promise<void>} Resolves once the lookup screen is initialized.
 */
async function handleViewProgramFeeRecordsRequested() {
  const token = loadToken();
  if (!token) {
    renderProgramFeeRecordsLookupScreen();
    setProgramFeeRecordsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderProgramFeeRecordsLookupScreen();
  renderProgramFeeRecordsTable([]);
  setProgramFeeRecordsMessage("Loading schools and programs...");

  try {
    const schoolsResponse = await fetchAllSchoolsForPrograms(token);
    schools = normalizeCollection(schoolsResponse).map(normalizeSchool);
    selectedRecordsSchoolId = schools[0]?.schoolId || "";
    recordsPrograms = selectedRecordsSchoolId
      ? await loadProgramsBySchool(selectedRecordsSchoolId, token)
      : [];

    renderProgramFeeRecordsLookupScreen({
      schools,
      recordsPrograms,
      selectedRecordsSchoolId,
      selectedRecordsProgramId: recordsPrograms[0]?.programId || ""
    });
    renderProgramFeeRecordsTable([]);
    bindProgramFeeRecordsEvents();
    setProgramFeeRecordsMessage(
      recordsPrograms.length
        ? "Select a program and load fee records."
        : "No programs found for selected school.",
      recordsPrograms.length ? "" : "error"
    );
  } catch (error) {
    renderProgramFeeRecordsLookupScreen({ schools: [], recordsPrograms: [] });
    bindProgramFeeRecordsEvents();
    setProgramFeeRecordsMessage(error.message || "Failed to load program fee records context.", "error");
  }
}

/**
 * Binds bind set program fee events.
 * @returns {void}
 */
/**
 * Binds specifically targeted event listeners for the 'Set Program Fee' workflow.
 * Manages cascading dropdown logic for schools -> programs and years -> semesters.
 * @returns {void} No return value.
 */
function bindSetProgramFeeEvents() {
  bindSetProgramFeeSchoolChange(async (schoolId) => {
    const token = loadToken();
    if (!token) {
      setProgramFeeMessage("Session expired. Please log in again.", "error");
      return;
    }

    selectedSchoolIdForProgramFee = schoolId;
    if (!schoolId) {
      setProgramFeeProgramOptions([]);
      setProgramFeeMessage("Select a school.");
      return;
    }

    setProgramFeeMessage("Loading programs...");

    try {
      const schoolPrograms = await loadProgramsBySchool(schoolId, token);
      setProgramFeeProgramOptions(schoolPrograms, schoolPrograms[0]?.programId || "");
      setProgramFeeMessage(schoolPrograms.length ? "Programs loaded." : "No programs found for selected school.");
    } catch (error) {
      setProgramFeeProgramOptions([]);
      setProgramFeeMessage(error.message || "Failed to load programs.", "error");
    }
  });

  bindSetProgramFeeAcademicYearChange(async (academicYearId) => {
    const token = loadToken();
    if (!token) {
      setProgramFeeMessage("Session expired. Please log in again.", "error");
      return;
    }

    if (!academicYearId) {
      setProgramFeeSemesterOptions([]);
      return;
    }

    setProgramFeeMessage("Loading semesters...");

    try {
      const semesters = await loadSemestersByAcademicYear(academicYearId, token);
      setProgramFeeSemesterOptions(semesters, semesters[0]?.semesterId || "");
      setProgramFeeMessage(semesters.length ? "Semesters loaded." : "No semesters found.");
    } catch (error) {
      setProgramFeeSemesterOptions([]);
      setProgramFeeMessage(error.message || "Failed to load semesters.", "error");
    }
  });

  bindSetProgramFeeSubmit(handleSetProgramFeeSubmit);
}

/**
 * Binds event listeners for the Fee Records Audit screen.
 * Triggers re-fetches when school filters change and orchestrates bulk record loading.
 * @returns {void} No return value.
 */
function bindProgramFeeRecordsEvents() {
  bindProgramFeeRecordsSchoolChange(async (schoolId) => {
    const token = loadToken();
    if (!token) {
      setProgramFeeRecordsMessage("Session expired. Please log in again.", "error");
      return;
    }

    selectedRecordsSchoolId = schoolId;
    renderProgramFeeRecordsTable([]);

    if (!schoolId) {
      recordsPrograms = [];
      setProgramFeeRecordsProgramOptions([]);
      setProgramFeeRecordsMessage("Select a school.");
      return;
    }

    setProgramFeeRecordsMessage("Loading programs...");

    try {
      recordsPrograms = await loadProgramsBySchool(schoolId, token);
      setProgramFeeRecordsProgramOptions(recordsPrograms, recordsPrograms[0]?.programId || "");
      setProgramFeeRecordsMessage(
        recordsPrograms.length
          ? "Select a program and load fee records."
          : "No programs found for selected school.",
        recordsPrograms.length ? "" : "error"
      );
    } catch (error) {
      recordsPrograms = [];
      setProgramFeeRecordsProgramOptions([]);
      setProgramFeeRecordsMessage(error.message || "Failed to load programs.", "error");
    }
  });

  bindLoadProgramFeeRecordsSubmit(handleLoadProgramFeeRecordsSubmit);
}

/**
 * Processes the final submission produced by the Program Fee configuration form.
 * Validates numeric inputs and triggers a refresh of the program's fee audit table on success.
 * @param {object} payload - Configuration data (program, year, semester, amount).
 * @returns {Promise<void>} Resolves once the fee is persisted.
 */
async function handleSetProgramFeeSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setProgramFeeMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.programId || !payload.academicYearId || !payload.semesterId) {
    setProgramFeeMessage("Program, academic year, and semester are required.", "error");
    return;
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    setProgramFeeMessage("Amount must be greater than zero.", "error");
    return;
  }

  setProgramFeeSubmitting(true);
  setProgramFeeMessage("Saving program fee...");

  try {
    await setProgramSemesterFee(payload, token);
    setProgramFeeMessage("Program fee configured successfully.", "success");
    await handleLoadProgramFeeRecordsSubmit(payload.programId);
  } catch (error) {
    setProgramFeeMessage(error.message || "Failed to configure program fee.", "error");
  } finally {
    setProgramFeeSubmitting(false);
  }
}

/**
 * Specifically loads and renders the fee history for a targeted academic program.
 * @param {string|number} programId - The program to audit.
 * @returns {Promise<void>} Resolves once the history grid is populated.
 */
async function handleLoadProgramFeeRecordsSubmit(programId) {
  const token = loadToken();
  if (!token) {
    setProgramFeeRecordsMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!programId) {
    setProgramFeeRecordsMessage("Select a program to load records.", "error");
    return;
  }

  setProgramFeeRecordsSubmitting(true);
  setProgramFeeRecordsMessage("Loading program fee records...");
  renderProgramFeeRecordsTable([]);

  try {
    const response = await fetchProgramFeeRecords(programId, token);
    const records = normalizeCollection(response).map(normalizeProgramFeeRecord);
    renderProgramFeeRecordsTable(records);
    setProgramFeeRecordsMessage(`Loaded ${records.length} record(s).`, "success");
  } catch (error) {
    renderProgramFeeRecordsTable([]);
    setProgramFeeRecordsMessage(error.message || "Failed to load program fee records.", "error");
  } finally {
    setProgramFeeRecordsSubmitting(false);
  }
}

/**
 * Triggers the student-specific payment recording workflow.
 * Pre-computes student options from existing history to accelerate the process.
 * @returns {Promise<void>} Resolves when the payment recording screen is active.
 */
async function handleRecordFeePaymentRequested() {
  const token = loadToken();
  if (!token) {
    renderRecordFeePaymentScreen();
    setFeePaymentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderRecordFeePaymentScreen();
  renderRecordedPaymentResult(null);
  renderStudentSearchResult(null);
  setFeePaymentsMessage("Loading payment context...");

  try {
    await ensureSharedFeeContext(token);
    await ensurePaymentRecords(token);
    availableStudents = buildStudentOptionsFromRecords(feePaymentRecords);
    selectedPaymentAcademicYearId = academicYears[0]?.academicYearId || "";
    const semesters = selectedPaymentAcademicYearId
      ? await loadSemestersByAcademicYear(selectedPaymentAcademicYearId, token)
      : [];

    renderRecordFeePaymentScreen({
      students: availableStudents,
      academicYears,
      semesters,
      selectedStudentId: availableStudents[0]?.studentId || "",
      selectedAcademicYearId: selectedPaymentAcademicYearId,
      selectedSemesterId: semesters[0]?.semesterId || ""
    });

    bindRecordFeePaymentEvents();
    setFeePaymentsMessage(
      availableStudents.length
        ? "Search by registration number or select a student, then record payment."
        : "Search student by registration number to start recording payment."
    );
  } catch (error) {
    renderRecordFeePaymentScreen({ students: [], academicYears: [], semesters: [] });
    bindRecordFeePaymentEvents();
    setFeePaymentsMessage(error.message || "Failed to load payment context.", "error");
  }
}

/**
 * Established listeners for the payment recording interface.
 * Handles real-time student lookups and specialized submission logic.
 * @returns {void} No return value.
 */
function bindRecordFeePaymentEvents() {
  bindPaymentAcademicYearChange(async (academicYearId) => {
    const token = loadToken();
    if (!token) {
      setFeePaymentsMessage("Session expired. Please log in again.", "error");
      return;
    }

    selectedPaymentAcademicYearId = academicYearId;
    if (!academicYearId) {
      setPaymentSemesterOptions([]);
      return;
    }

    setFeePaymentsMessage("Loading semesters...");

    try {
      const semesters = await loadSemestersByAcademicYear(academicYearId, token);
      setPaymentSemesterOptions(semesters, semesters[0]?.semesterId || "");
      setFeePaymentsMessage(semesters.length ? "Semesters loaded." : "No semesters found.");
    } catch (error) {
      setPaymentSemesterOptions([]);
      setFeePaymentsMessage(error.message || "Failed to load semesters.", "error");
    }
  });

  bindStudentRegistrationSearchSubmit(handleSearchStudentForPayment);
  bindSelectSearchedStudent(handleSelectSearchedStudentForPayment);
  bindRecordFeePaymentSubmit(handleRecordFeePaymentSubmit);
}

/**
 * Performs a targeted student search by registration number to facilitate payment recording.
 * @param {string} registrationNumber - The unique student identifier.
 * @returns {Promise<void>} Resolves after the search results are rendered.
 */
async function handleSearchStudentForPayment(registrationNumber) {
  const token = loadToken();
  if (!token) {
    setFeePaymentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!registrationNumber) {
    setFeePaymentsMessage("Enter a registration number.", "error");
    return;
  }

  setStudentSearchSubmitting(true);
  setFeePaymentsMessage("Searching student...");
  renderStudentSearchResult(null);

  try {
    const response = await fetchStudentDetailsByRegistrationNumber(registrationNumber, token);
    const student = normalizeStudentDetails(unwrapEntity(response), registrationNumber);
    renderStudentSearchResult(student);
    setFeePaymentsMessage("Student found. Click 'Use This Student' to select.", "success");
  } catch (error) {
    renderStudentSearchResult(null);
    setFeePaymentsMessage(error.message || "Failed to find student.", "error");
  } finally {
    setStudentSearchSubmitting(false);
  }
}

/**
 * Transitions the payment recording form to use a specific student found during search.
 * @param {object} student - The normalized student object to select.
 * @returns {void} Updates the form state.
 */
function handleSelectSearchedStudentForPayment(student) {
  availableStudents = upsertStudentOption(availableStudents, student);
  setPaymentStudentOptions(availableStudents, student.studentId);
  setFeePaymentsMessage("Student selected for payment.", "success");
}

/**
 * Transmits a student payment record to the backend ledger.
 * @param {object} payload - Payment details (student, semester, amount).
 * @returns {Promise<void>} Resolves when the payment is confirmed and local state updated.
 */
async function handleRecordFeePaymentSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setFeePaymentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.studentId || !payload.semesterId) {
    setFeePaymentsMessage("Student and semester are required.", "error");
    return;
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    setFeePaymentsMessage("Amount must be greater than zero.", "error");
    return;
  }

  setRecordPaymentSubmitting(true);
  setFeePaymentsMessage("Recording payment...");

  try {
    const result = await recordStudentFeePayment(payload, token);
    renderRecordedPaymentResult(result || payload);
    setFeePaymentsMessage("Payment recorded successfully.", "success");
    await ensurePaymentRecords(token, true);
    availableStudents = buildStudentOptionsFromRecords(feePaymentRecords, availableStudents);
    setPaymentStudentOptions(availableStudents, payload.studentId);
  } catch (error) {
    setFeePaymentsMessage(error.message || "Failed to record payment.", "error");
  } finally {
    setRecordPaymentSubmitting(false);
  }
}

/**
 * Navigates to the bulk fee payments ledger view.
 * @returns {Promise<void>} Resolves once all historical payment records are rendered.
 */
async function handleViewFeePaymentsRequested() {
  const token = loadToken();
  if (!token) {
    renderFeePaymentsScreen([]);
    setFeePaymentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderFeePaymentsScreen([]);
  setFeePaymentsMessage("Loading fee payment records...");

  try {
    await ensurePaymentRecords(token, true);
    currentPaymentRecords = [...feePaymentRecords];
    renderFeePaymentsScreen(currentPaymentRecords);
    bindFeePaymentsEvents();
    setFeePaymentsMessage(`Loaded ${currentPaymentRecords.length} payment record(s).`, "success");
  } catch (error) {
    renderFeePaymentsScreen([]);
    bindFeePaymentsEvents();
    setFeePaymentsMessage(error.message || "Failed to load payment records.", "error");
  }
}

/**
 * Binds interactive triggers for the fee payments ledger, including search and bulk actions.
 * @returns {void} No return value.
 */
function bindFeePaymentsEvents() {
  bindFeePaymentsSearch((query) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      currentPaymentRecords = [...feePaymentRecords];
      renderFeePaymentsScreen(currentPaymentRecords);
      bindFeePaymentsEvents();
      setFeePaymentsMessage(`Loaded ${currentPaymentRecords.length} payment record(s).`, "success");
      return;
    }

    currentPaymentRecords = feePaymentRecords.filter((record) => {
      const registrationMatch = String(record.registrationNumber || "")
        .toLowerCase()
        .includes(normalized);
      const nameMatch = String(record.studentName || "")
        .toLowerCase()
        .includes(normalized);
      const studentIdMatch = String(record.studentId || "")
        .toLowerCase()
        .includes(normalized);
      return registrationMatch || nameMatch || studentIdMatch;
    });

    renderFeePaymentsScreen(currentPaymentRecords);
    bindFeePaymentsEvents();
    setFeePaymentsMessage(`Search returned ${currentPaymentRecords.length} record(s).`, "success");
  });

  bindCompleteFeePaymentAction(handleCompleteFeePaymentFromRecord);
}

/**
 * Marks a student's semester fee as fully cleared.
 * @param {object} params - The unique relationship identifiers (studentId, semesterId).
 * @returns {Promise<void>} Resolves when the status change is reflected in the ledger.
 */
async function handleCompleteFeePaymentFromRecord({ studentId, semesterId }) {
  const token = loadToken();
  if (!token) {
    setFeePaymentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  setFeePaymentsMessage("Completing student payment...");

  try {
    await clearStudentSemesterFee(studentId, semesterId, token);
    await ensurePaymentRecords(token, true);
    currentPaymentRecords = [...feePaymentRecords];
    renderFeePaymentsScreen(currentPaymentRecords);
    bindFeePaymentsEvents();
    setFeePaymentsMessage("Student fee marked as cleared.", "success");
  } catch (error) {
    setFeePaymentsMessage(error.message || "Failed to clear student fee.", "error");
  }
}

/**
 * Initiates the 'Clear Fee' status verification and processing workflow.
 * @returns {Promise<void>} Resolves when the clearance UI is ready.
 */
async function handleClearStudentFeeRequested() {
  const token = loadToken();
  if (!token) {
    renderClearStudentFeeScreen();
    setClearFeeMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderClearStudentFeeScreen();
  renderClearFeeStudentResult(null);
  renderFeeStatusResult(null);
  setClearFeeMessage("Loading clear-fee context...");

  try {
    await ensureSharedFeeContext(token);
    await ensurePaymentRecords(token);

    availableStudents = buildStudentOptionsFromRecords(feePaymentRecords, availableStudents);
    selectedClearAcademicYearId = academicYears[0]?.academicYearId || "";
    const semesters = selectedClearAcademicYearId
      ? await loadSemestersByAcademicYear(selectedClearAcademicYearId, token)
      : [];

    renderClearStudentFeeScreen({
      students: availableStudents,
      academicYears,
      semesters,
      selectedStudentId: availableStudents[0]?.studentId || "",
      selectedAcademicYearId: selectedClearAcademicYearId,
      selectedSemesterId: semesters[0]?.semesterId || ""
    });

    bindClearStudentFeeEvents();
    setClearFeeMessage(
      "Search student by registration number or choose from the list, then load and clear fee status."
    );
  } catch (error) {
    renderClearStudentFeeScreen({ students: [], academicYears: [], semesters: [] });
    bindClearStudentFeeEvents();
    setClearFeeMessage(error.message || "Failed to load clear-fee context.", "error");
  }
}

/**
 * Binds UI listeners specifically for the fee clearance status check workflow.
 * @returns {void} No return value.
 */
function bindClearStudentFeeEvents() {
  bindClearFeeAcademicYearChange(async (academicYearId) => {
    const token = loadToken();
    if (!token) {
      setClearFeeMessage("Session expired. Please log in again.", "error");
      return;
    }

    selectedClearAcademicYearId = academicYearId;
    renderFeeStatusResult(null);

    if (!academicYearId) {
      setClearFeeSemesterOptions([]);
      return;
    }

    setClearFeeMessage("Loading semesters...");

    try {
      const semesters = await loadSemestersByAcademicYear(academicYearId, token);
      setClearFeeSemesterOptions(semesters, semesters[0]?.semesterId || "");
      setClearFeeMessage(semesters.length ? "Semesters loaded." : "No semesters found.");
    } catch (error) {
      setClearFeeSemesterOptions([]);
      setClearFeeMessage(error.message || "Failed to load semesters.", "error");
    }
  });

  bindClearFeeSearchSubmit(handleClearFeeSearchStudent);
  bindSelectClearFeeStudent(handleSelectStudentForClearFee);
  bindLoadFeeStatusSubmit(handleLoadFeeStatusSubmit);
  bindClearStudentFeeSubmit(handleClearFeeSubmit);
}

/**
 * Searches for a student explicitly to verify their current fee clearing eligibility.
 * @param {string} registrationNumber - Student identifier.
 * @returns {Promise<void>} Resolves after the student metadata is loaded.
 */
async function handleClearFeeSearchStudent(registrationNumber) {
  const token = loadToken();
  if (!token) {
    setClearFeeMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!registrationNumber) {
    setClearFeeMessage("Enter a registration number.", "error");
    return;
  }

  setClearFeeSearchSubmitting(true);
  setClearFeeMessage("Searching student...");
  renderClearFeeStudentResult(null);

  try {
    const response = await fetchStudentDetailsByRegistrationNumber(registrationNumber, token);
    const student = normalizeStudentDetails(unwrapEntity(response), registrationNumber);
    renderClearFeeStudentResult(student);
    setClearFeeMessage("Student found. Click 'Use This Student' to continue.", "success");
  } catch (error) {
    renderClearFeeStudentResult(null);
    setClearFeeMessage(error.message || "Failed to find student.", "error");
  } finally {
    setClearFeeSearchSubmitting(false);
  }
}

/**
 * Handles handle select student for clear fee.
 * @param {*} student
 * @returns {void}
 */
function handleSelectStudentForClearFee(student) {
  availableStudents = upsertStudentOption(availableStudents, student);
  setClearFeeStudentOptions(availableStudents, student.studentId);
  setClearFeeMessage("Student selected.", "success");
}

/**
 * Retrieves the specific fee status for a student in a designated semester.
 * Determines if the student's dues are fully paid or pending.
 * @param {object} params - Identification (studentId, semesterId).
 * @returns {Promise<void>} Resolves once the status profile is rendered.
 */
async function handleLoadFeeStatusSubmit({ studentId, semesterId }) {
  const token = loadToken();
  if (!token) {
    setClearFeeMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!studentId || !semesterId) {
    setClearFeeMessage("Student and semester are required.", "error");
    return;
  }

  setLoadFeeStatusSubmitting(true);
  setClearFeeMessage("Loading fee status...");
  renderFeeStatusResult(null);

  try {
    const response = await fetchStudentSemesterFeeStatus(studentId, semesterId, token);
    currentFeeStatus = normalizeFeeRecord(unwrapEntity(response));
    renderFeeStatusResult(currentFeeStatus);
    setClearFeeMessage("Fee status loaded.", "success");
  } catch (error) {
    currentFeeStatus = null;
    renderFeeStatusResult(null);
    setClearFeeMessage(error.message || "Failed to load fee status.", "error");
  } finally {
    setLoadFeeStatusSubmitting(false);
  }
}

/**
 * Handles handle clear fee submit.
 * @param {object} params
 * @param {*} params.studentId
 * @param {*} params.semesterId
 * @returns {Promise<*>}
 */
async function handleClearFeeSubmit({ studentId, semesterId }) {
  const token = loadToken();
  if (!token) {
    setClearFeeMessage("Session expired. Please log in again.", "error");
    return;
  }

  setClearFeeActionSubmitting(true);
  setClearFeeMessage("Clearing student fee...");

  try {
    await clearStudentSemesterFee(studentId, semesterId, token);
    const refreshedStatus = await fetchStudentSemesterFeeStatus(studentId, semesterId, token);
    currentFeeStatus = normalizeFeeRecord(unwrapEntity(refreshedStatus));
    renderFeeStatusResult(currentFeeStatus);
    await ensurePaymentRecords(token, true);
    setClearFeeMessage("Student fee marked as cleared.", "success");
  } catch (error) {
    setClearFeeMessage(error.message || "Failed to clear student fee.", "error");
  } finally {
    setClearFeeActionSubmitting(false);
  }
}

/**
 * Ensures ensure shared fee context.
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureSharedFeeContext(token) {
  const [programsResponse, yearsResponse] = await Promise.all([
    fetchAllProgramsMinimal(token),
    fetchAllAcademicYears(token)
  ]);

  programs = normalizeCollection(programsResponse).map(normalizeProgram);
  academicYears = normalizeCollection(yearsResponse).map(normalizeAcademicYear);
}

/**
 * Loads load programs by school.
 * @param {string|number} schoolId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function loadProgramsBySchool(schoolId, token) {
  if (!schoolId) {
    return [];
  }

  if (programsBySchoolId.has(schoolId)) {
    return programsBySchoolId.get(schoolId);
  }

  const response = await fetchProgramsBySchool(schoolId, token);
  const schoolPrograms = normalizeCollection(response).map(normalizeProgram);
  programsBySchoolId.set(schoolId, schoolPrograms);
  return schoolPrograms;
}

/**
 * Ensures ensure payment records.
 * @param {string} token
 * @param {*} forceReload
 * @returns {Promise<*>}
 */
async function ensurePaymentRecords(token, forceReload = false) {
  if (!forceReload && feePaymentRecords.length > 0) {
    return feePaymentRecords;
  }

  const response = await fetchFeePaymentRecords(token);
  let recordsSource = [];

  if (Array.isArray(response)) {
    recordsSource = response;
  } else if (response && typeof response === "object") {
    recordsSource = normalizeCollection(response);
  }

  feePaymentRecords = recordsSource.map(normalizeFeeRecord);
  return feePaymentRecords;
}

/**
 * Loads load semesters by academic year.
 * @param {string|number} academicYearId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function loadSemestersByAcademicYear(academicYearId, token) {
  if (!academicYearId) {
    return [];
  }

  if (semestersByAcademicYearId.has(academicYearId)) {
    return semestersByAcademicYearId.get(academicYearId);
  }

  const response = await fetchSemestersByAcademicYear(academicYearId, token);
  const semesters = normalizeCollection(response).map(normalizeSemester);
  semestersByAcademicYearId.set(academicYearId, semesters);
  return semesters;
}

/**
 * Builds build student options from records.
 * @param {Array<*>} records
 * @param {Array<*>} seedStudents
 * @returns {*}
 */
function buildStudentOptionsFromRecords(records, seedStudents = []) {
  const unique = new Map();

  seedStudents.forEach((student) => {
    const id = String(student.studentId || "");
    if (!id) {
      return;
    }

    unique.set(id, {
      studentId: id,
      registrationNumber: student.registrationNumber || "",
      studentName: student.studentName || student.fullName || ""
    });
  });

  records.forEach((record) => {
    const studentId = String(record.studentId || "");
    if (!studentId) {
      return;
    }

    unique.set(studentId, {
      studentId,
      registrationNumber: record.registrationNumber || "",
      studentName: record.studentName || ""
    });
  });

  return [...unique.values()];
}

/**
 * Executes upsert student option.
 * @param {Array<*>} currentStudents
 * @param {*} student
 * @returns {*}
 */
function upsertStudentOption(currentStudents, student) {
  const nextStudents = Array.isArray(currentStudents) ? [...currentStudents] : [];
  const normalized = {
    studentId: String(student.studentId || ""),
    registrationNumber: String(student.registrationNumber || ""),
    studentName: String(student.studentName || "")
  };

  const existingIndex = nextStudents.findIndex(
    (item) => String(item.studentId || "") === normalized.studentId
  );

  if (existingIndex >= 0) {
    nextStudents[existingIndex] = {
      ...nextStudents[existingIndex],
      ...normalized
    };
    return nextStudents;
  }

  return [normalized, ...nextStudents];
}

/**
 * Normalizes normalize program.
 * @param {*} item
 * @returns {*}
 */
function normalizeProgram(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    programId: String(data.id || data.programId || ""),
    name: data.name || data.programName || "",
    code: data.code || data.programCode || ""
  };
}

/**
 * Normalizes normalize school.
 * @param {*} item
 * @returns {*}
 */
function normalizeSchool(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    schoolId: String(data.id || data.schoolId || ""),
    name: data.name || data.schoolName || "",
    code: data.code || data.schoolCode || ""
  };
}

/**
 * Normalizes normalize academic year.
 * @param {*} item
 * @returns {*}
 */
function normalizeAcademicYear(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    academicYearId: String(data.academicYearId || data.id || ""),
    name: data.name || data.academicYearName || "",
    active: resolveActiveState(data)
  };
}

/**
 * Normalizes normalize semester.
 * @param {*} item
 * @returns {*}
 */
function normalizeSemester(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    semesterId: String(data.semesterId || data.id || ""),
    name: data.name || `Semester ${data.number || data.semesterNumber || ""}`.trim(),
    number: data.number ?? data.semesterNumber,
    active: resolveActiveState(data)
  };
}

/**
 * Resolves an active-state flag from known backend representations.
 * @param {object} data
 * @returns {boolean}
 */
function resolveActiveState(data) {
  const rawStatus = data.status ?? data.state;
  const normalizedStatus =
    typeof rawStatus === "string" ? rawStatus.trim().toLowerCase() : "";

  return (
    Boolean(data.active) ||
    Boolean(data.isActive) ||
    normalizedStatus === "active" ||
    normalizedStatus === "current"
  );
}

/**
 * Normalizes normalize fee record.
 * @param {*} item
 * @returns {*}
 */
function normalizeFeeRecord(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    studentId: String(data.studentId || ""),
    registrationNumber: data.registrationNumber || "",
    studentName: data.studentName || "",
    programId: String(data.programId || ""),
    programName: data.programName || "",
    semesterId: String(data.semesterId || ""),
    academicYearId: String(data.academicYearId || ""),
    requiredAmount: Number(data.requiredAmount || 0),
    amountPaid: Number(data.amountPaid || 0),
    balance: Number(data.balance || 0),
    cleared: Boolean(data.cleared)
  };
}

/**
 * Normalizes normalize program fee record.
 * @param {*} item
 * @returns {*}
 */
function normalizeProgramFeeRecord(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    programId: String(data.programId || ""),
    programName: data.programName || "",
    semesterId: String(data.semesterId || ""),
    semesterNumber: data.semesterNumber ?? "",
    semesterName: data.semesterName || "",
    academicYearId: String(data.academicYearId || ""),
    academicYearName: data.academicYearName || "",
    amount: Number(data.amount || 0)
  };
}

/**
 * Normalizes normalize student details.
 * @param {*} item
 * @param {*} fallbackRegistrationNumber
 * @returns {*}
 */
function normalizeStudentDetails(item, fallbackRegistrationNumber = "") {
  const data = item && typeof item === "object" ? item : {};
  return {
    studentId: String(data.studentId || data.id || ""),
    registrationNumber: String(data.registrationNumber || fallbackRegistrationNumber || ""),
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    studentName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    programName: data.programName || ""
  };
}

/**
 * Normalizes normalize collection.
 * @param {*} responseData
 * @returns {*}
 */
function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = [
    "data",
    "content",
    "items",
    "results",
    "records",
    "payments",
    "programs",
    "schools",
    "academicYears",
    "semesters"
  ];

  for (const key of candidateKeys) {
    const value = responseData[key];
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nested = normalizeCollection(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  for (const value of Object.values(responseData)) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  for (const value of Object.values(responseData)) {
    if (value && typeof value === "object") {
      const nested = normalizeCollection(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  if (
    responseData.studentId ||
    responseData.programId ||
    responseData.semesterId ||
    responseData.academicYearId ||
    responseData.registrationNumber
  ) {
    return [responseData];
  }

  return [];
}

/**
 * Executes unwrap entity.
 * @param {*} responseData
 * @returns {*}
 */
function unwrapEntity(responseData) {
  if (!responseData || typeof responseData !== "object" || Array.isArray(responseData)) {
    return responseData;
  }

  const wrapperKeys = ["data", "result", "item", "content", "payload", "record"];
  for (const key of wrapperKeys) {
    const value = responseData[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return unwrapEntity(value);
    }
  }

  return responseData;
}
