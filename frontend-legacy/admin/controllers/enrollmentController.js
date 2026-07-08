/**
 * @fileoverview Administrative controller for student enrollments.
 * Manages the student admission process, enrollment history tracking,
 * and lifecycle management of student registration statuses.
 * @module admin/controllers/enrollmentController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import { fetchAllSchoolsForPrograms, fetchProgramsBySchool } from "../models/programModel.js";
import {
  cancelEnrollment,
  enrollStudent,
  fetchAllEnrollments,
  updateEnrollmentStatus
} from "../models/enrollmentModel.js";
import {
  bindEnrollmentsSearch,
  bindEnrollSchoolChange,
  bindEnrollStudentSubmit,
  bindEnrollStudentTrigger,
  bindEnrollmentDetailsActions,
  bindEnrollmentDetailsTrigger,
  bindEnrollmentSelect,
  bindViewAllEnrollmentsTrigger,
  renderEnrolledStudentResult,
  renderEnrollmentDetailsScreen,
  renderEnrollmentsScreen,
  renderEnrollStudentForm,
  setEnrollmentDetailsMessage,
  setEnrollmentDetailsSubmitting,
  setEnrollmentsMessage,
  setEnrollProgramOptions,
  setEnrollStudentMessage,
  setEnrollStudentSubmitting
} from "../views/enrollmentView.js";

let schoolsCache = [];
const programsCacheBySchoolId = new Map();
let allEnrollments = [];
let currentSearchQuery = "";
let currentListMode = "all";
let selectedEnrollment = null;

/**
 * Initializes the enrollment controller by binding primary UI triggers.
 * Sets up listeners for starting new enrollments, viewing specific details, or listing all records.
 * @returns {void} No return value.
 */
export function initEnrollmentController() {
  bindEnrollStudentTrigger(handleEnrollStudentRequested);
  bindEnrollmentDetailsTrigger(handleEnrollmentDetailsRequested);
  bindViewAllEnrollmentsTrigger(handleViewAllEnrollmentsRequested);
}

/**
 * Triggers the UI workflow for enrolling a new student.
 * Prepares the environment by resetting the form and loading school options.
 * @returns {Promise<void>} Resolves when the enrollment form is ready for input.
 */
async function handleEnrollStudentRequested() {
  renderEnrollStudentForm({ schools: [], programs: [] });
  renderEnrolledStudentResult(null);
  setEnrollStudentMessage("Loading schools...");
  bindEnrollStudentSubmit(handleEnrollStudentSubmit);
  bindEnrollSchoolChange(handleEnrollSchoolChange);

  const token = loadToken();
  if (!token) {
    setEnrollStudentMessage("Session expired. Please log in again.", "error");
    return;
  }

  try {
    schoolsCache = await ensureSchools(token);
    renderEnrollStudentForm({ schools: schoolsCache, programs: [] });
    renderEnrolledStudentResult(null);
    setEnrollStudentMessage(
      schoolsCache.length ? "Fill student details and select school/program." : "No schools available.",
      schoolsCache.length ? "" : "error"
    );
    bindEnrollStudentSubmit(handleEnrollStudentSubmit);
    bindEnrollSchoolChange(handleEnrollSchoolChange);
  } catch (error) {
    setEnrollStudentMessage(error.message || "Failed to load schools.", "error");
  }
}

/**
 * Responds to school selection changes in the enrollment form.
 * Refreshes available program options based on the chosen school.
 * @param {string|number} schoolId - The unique identifier of the selected school.
 * @returns {Promise<void>} Resolves when the program dropdown is updated.
 */
async function handleEnrollSchoolChange(schoolId) {
  const token = loadToken();
  if (!token) {
    setEnrollStudentMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!schoolId) {
    setEnrollProgramOptions([]);
    return;
  }

  setEnrollStudentMessage("Loading programs...");
  try {
    const programs = await ensureProgramsBySchool(schoolId, token);
    setEnrollProgramOptions(programs);
    setEnrollStudentMessage("");
  } catch (error) {
    setEnrollProgramOptions([]);
    setEnrollStudentMessage(error.message || "Failed to load programs.", "error");
  }
}

/**
 * Processes the final submission of the student enrollment form.
 * Validates mandatory fields and communicates with the backend enrollment API.
 * @param {object} payload - Comprehensive student and school/program selection data.
 * @returns {Promise<void>} Resolves once the enrollment is confirmed.
 */
async function handleEnrollStudentSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setEnrollStudentMessage("Session expired. Please log in again.", "error");
    return;
  }

  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "nationalId",
    "secondarySchool",
    "secondaryPerformance",
    "schoolId",
    "programId"
  ];
  const hasMissingField = requiredFields.some((field) => !payload[field]);
  if (hasMissingField) {
    setEnrollStudentMessage("All fields are required.", "error");
    return;
  }

  setEnrollStudentSubmitting(true);
  setEnrollStudentMessage("");

  try {
    const response = await enrollStudent(payload, token);
    renderEnrolledStudentResult(response);
    setEnrollStudentMessage("Student successfully enrolled.", "success");
  } catch (error) {
    renderEnrolledStudentResult(null);
    setEnrollStudentMessage(error.message || "Failed to enroll student.", "error");
  } finally {
    setEnrollStudentSubmitting(false);
  }
}

/**
 * Handles handle view all enrollments requested.
 * @returns {Promise<*>}
 */
async function handleViewAllEnrollmentsRequested() {
  currentListMode = "all";
  await renderEnrollmentList("all");
}

/**
 * Transitions the UI to the detailed enrollment lookup view.
 * @returns {Promise<void>} Resolves after the detailed enrollment list is loaded.
 */
async function handleEnrollmentDetailsRequested() {
  currentListMode = "details";
  await renderEnrollmentList("details");
}

/**
 * Internal logic for fetching and rendering a list of enrollments.
 * Supports different UI modes ('all' vs 'details') while using shared listing logic.
 * @param {string} mode - The targeted view mode.
 * @returns {Promise<void>} Resolves once the enrollment grid is populated.
 */
async function renderEnrollmentList(mode) {
  const token = loadToken();
  if (!token) {
    renderEnrollmentsScreen([], currentSearchQuery, mode);
    setEnrollmentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderEnrollmentsScreen([], currentSearchQuery, mode);
  setEnrollmentsMessage("Loading enrollments...");

  try {
    const responseData = await fetchAllEnrollments(token);
    allEnrollments = normalizeCollection(responseData).map(normalizeEnrollmentRecord);
    const filtered = filterEnrollments(allEnrollments, currentSearchQuery);
    renderEnrollmentsScreen(filtered, currentSearchQuery, mode);
    setEnrollmentsMessage(`Loaded ${filtered.length} enrollment(s).`, "success");
    bindEnrollmentListEvents();
  } catch (error) {
    renderEnrollmentsScreen([], currentSearchQuery, mode);
    setEnrollmentsMessage(error.message || "Failed to load enrollments.", "error");
  }
}

/**
 * Establishes event listeners for the enrollment list, including search and individual record selection.
 * @returns {void} No return value.
 */
function bindEnrollmentListEvents() {
  bindEnrollmentsSearch((query) => {
    currentSearchQuery = query;
    const filtered = filterEnrollments(allEnrollments, currentSearchQuery);
    renderEnrollmentsScreen(filtered, currentSearchQuery, currentListMode);
    setEnrollmentsMessage(
      currentSearchQuery
        ? `Search returned ${filtered.length} enrollment(s).`
        : `Loaded ${filtered.length} enrollment(s).`,
      filtered.length || !currentSearchQuery ? "success" : "error"
    );
    bindEnrollmentListEvents();
  });

  bindEnrollmentSelect(handleEnrollmentSelected);
}

/**
 * Reacts to an enrollment selection from a list, launching the detailed management view.
 * @param {string|number} enrollmentId - Unique ID of the target enrollment.
 * @returns {void} Opens the enrollment profile and actions screen.
 */
function handleEnrollmentSelected(enrollmentId) {
  selectedEnrollment = allEnrollments.find(
    (item) => String(item.enrollmentId) === String(enrollmentId)
  );
  if (!selectedEnrollment) {
    setEnrollmentsMessage("Selected enrollment was not found.", "error");
    return;
  }

  renderEnrollmentDetailsScreen(selectedEnrollment, currentListMode);
  bindEnrollmentDetailsActions({
    onUpdateStatus: handleEnrollmentStatusUpdate,
    onCancelEnrollment: handleEnrollmentCancel,
    onClose: (mode) => renderEnrollmentList(mode)
  });
}

/**
 * Updates the administrative status of a student's enrollment (e.g., ADMITTED, PENDING).
 * Synchronizes the UI and local state with the server's update.
 * @param {string|number} enrollmentId - The enrollment record to update.
 * @param {string} status - The new status string.
 * @returns {Promise<void>} Resolves when the change is reflected in the UI.
 */
async function handleEnrollmentStatusUpdate(enrollmentId, status) {
  const token = loadToken();
  if (!token) {
    setEnrollmentDetailsMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!status) {
    setEnrollmentDetailsMessage("Select a valid status.", "error");
    return;
  }

  setEnrollmentDetailsSubmitting(true);
  setEnrollmentDetailsMessage("Updating enrollment status...");
  try {
    const response = await updateEnrollmentStatus(enrollmentId, status, token);
    const updated = normalizeEnrollmentRecord(response || {});
    allEnrollments = allEnrollments.map((item) =>
      String(item.enrollmentId) === String(enrollmentId) ? { ...item, ...updated } : item
    );
    selectedEnrollment = allEnrollments.find(
      (item) => String(item.enrollmentId) === String(enrollmentId)
    );
    if (selectedEnrollment) {
      renderEnrollmentDetailsScreen(selectedEnrollment, currentListMode);
      bindEnrollmentDetailsActions({
        onUpdateStatus: handleEnrollmentStatusUpdate,
        onCancelEnrollment: handleEnrollmentCancel,
        onClose: (mode) => renderEnrollmentList(mode)
      });
      setEnrollmentDetailsMessage("Enrollment status updated successfully.", "success");
    }
  } catch (error) {
    setEnrollmentDetailsMessage(error.message || "Failed to update enrollment status.", "error");
  } finally {
    setEnrollmentDetailsSubmitting(false);
  }
}

/**
 * Cancels an active or pending student enrollment with a mandatory justification.
 * @param {string|number} enrollmentId - Identity of the enrollment to cancel.
 * @param {string} reason - Detailed explanation for the cancellation.
 * @returns {Promise<void>} Resolves after the cancellation status is saved and displayed.
 */
async function handleEnrollmentCancel(enrollmentId, reason) {
  const token = loadToken();
  if (!token) {
    setEnrollmentDetailsMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!reason) {
    setEnrollmentDetailsMessage("Cancellation reason is required.", "error");
    return;
  }

  setEnrollmentDetailsSubmitting(true);
  setEnrollmentDetailsMessage("Cancelling enrollment...");
  try {
    const response = await cancelEnrollment(enrollmentId, reason, token);
    const updated = normalizeEnrollmentRecord(response || {});
    allEnrollments = allEnrollments.map((item) =>
      String(item.enrollmentId) === String(enrollmentId) ? { ...item, ...updated } : item
    );
    selectedEnrollment = allEnrollments.find(
      (item) => String(item.enrollmentId) === String(enrollmentId)
    );
    if (selectedEnrollment) {
      renderEnrollmentDetailsScreen(selectedEnrollment, currentListMode);
      bindEnrollmentDetailsActions({
        onUpdateStatus: handleEnrollmentStatusUpdate,
        onCancelEnrollment: handleEnrollmentCancel,
        onClose: (mode) => renderEnrollmentList(mode)
      });
      setEnrollmentDetailsMessage("Enrollment cancelled successfully.", "success");
    }
  } catch (error) {
    setEnrollmentDetailsMessage(error.message || "Failed to cancel enrollment.", "error");
  } finally {
    setEnrollmentDetailsSubmitting(false);
  }
}

/**
 * Ensures ensure schools.
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureSchools(token) {
  if (schoolsCache.length > 0) {
    return schoolsCache;
  }

  const responseData = await fetchAllSchoolsForPrograms(token);
  schoolsCache = normalizeCollection(responseData);
  return schoolsCache;
}

/**
 * Ensures ensure programs by school.
 * @param {string|number} schoolId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureProgramsBySchool(schoolId, token) {
  if (programsCacheBySchoolId.has(schoolId)) {
    return programsCacheBySchoolId.get(schoolId);
  }

  const responseData = await fetchProgramsBySchool(schoolId, token);
  const programs = normalizeCollection(responseData);
  programsCacheBySchoolId.set(schoolId, programs);
  return programs;
}

/**
 * Filters a set of enrollment records based on a generic keyword search.
 * Searches across name, registration number, email, school, and status.
 * @param {Array<object>} records - The comprehensive enrollment list.
 * @param {string} query - The search string.
 * @returns {Array<object>} The filtered subset of enrollments.
 */
function filterEnrollments(records, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) => {
    const fields = [
      record.studentName,
      record.registrationNumber,
      record.studentEmail,
      record.program,
      record.school,
      record.status,
      record.enrollmentYear
    ];
    return fields.some((value) =>
      String(value === null || value === undefined ? "" : value)
        .toLowerCase()
        .includes(normalizedQuery)
    );
  });
}

/**
 * Normalizes raw API enrollment records into a consistent structure for the view templates.
 * @param {object} record - The JSON object from the server.
 * @returns {object} A predictable enrollment data object.
 */
function normalizeEnrollmentRecord(record) {
  const data = record && typeof record === "object" ? record : {};
  return {
    enrollmentId: String(data.enrollmentId || data.id || ""),
    studentId: String(data.studentId || ""),
    studentName: data.studentName || data.name || "",
    registrationNumber: data.registrationNumber || "",
    studentEmail: data.studentEmail || data.email || "",
    program: data.program || "",
    school: data.school || "",
    enrollmentYear: data.enrollmentYear ?? "",
    status: data.status || "",
    cancelledAt: data.cancelledAt || "",
    cancellationReason: data.cancellationReason || ""
  };
}

/**
 * Standardizes API responses into a clean array of objects by navigating potential wrappers.
 * @param {*} responseData - Raw response from a university enrollment endpoint.
 * @returns {Array<object>} A flat list of records.
 */
function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = ["data", "content", "items", "results", "enrollments", "programs", "schools"];
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

  if (responseData.enrollmentId || responseData.studentId || responseData.registrationNumber) {
    return [responseData];
  }

  return [];
}
