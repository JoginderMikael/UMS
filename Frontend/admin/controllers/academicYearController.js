/**
 * @fileoverview Administrative controller for managing Academic Years and Semesters.
 * This module coordinates the creation and activation of academic periods,
 * ensuring the system's calendar reflects current educational cycles.
 * @module admin/controllers/academicYearController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import {
  activateAcademicYear,
  activateSemester,
  createAcademicYear,
  createSemester,
  fetchAllAcademicYears,
  fetchSemestersByAcademicYear
} from "../models/academicYearModel.js";
import {
  bindAcademicYearFunctionChange,
  bindAcademicYearTabTrigger,
  bindActivateAcademicYearRow,
  bindActivateAcademicYearSubmit,
  bindActivateSemesterRow,
  bindActivateSemesterSubmit,
  bindCreateAcademicYearSubmit,
  bindCreateSemesterSubmit,
  bindSemesterAcademicYearChange,
  bindSemesterFunctionChange,
  bindSemesterTabTrigger,
  renderAcademicYearScreen,
  renderSemesterScreen,
  setAcademicYearMessage,
  setAcademicYearSubmitting,
  setSemesterMessage,
  setSemesterSubmitting
} from "../views/academicYearView.js";

let academicYears = [];
let semesters = [];
let selectedAcademicYearFunction = "view";
let selectedSemesterFunction = "view";
let selectedAcademicYearIdForSemesters = "";

/**
 * Initializes the academic year controller by establishing primary tab triggers.
 * Sets up listeners for switching between Year management and Semester management views.
 * @returns {void} No return value.
 */
export function initAcademicYearController() {
  bindAcademicYearTabTrigger(handleAcademicYearTabRequested);
  bindSemesterTabTrigger(handleSemesterTabRequested);
}

/**
 * Responds to requests to view the Academic Year management tab.
 * Resets the active function to 'view' and triggers a data refresh.
 * @returns {Promise<void>} Resolves when the view has been rendered.
 */
async function handleAcademicYearTabRequested() {
  selectedAcademicYearFunction = "view";
  await loadAcademicYearsAndRender();
}

/**
 * Fetches the latest academic year data from the backend and updates the UI.
 * Handles session validation and provides visual feedback during the loading process.
 * @param {string} [message=""] - An optional status message to display after rendering.
 * @param {string} [type=""] - The style of the status message (e.g., 'success', 'error').
 * @returns {Promise<void>} Resolves once the academic years are displayed.
 */
async function loadAcademicYearsAndRender(message = "", type = "") {
  const token = loadToken();
  if (!token) {
    renderAcademicYearScreen({
      selectedFunction: selectedAcademicYearFunction,
      academicYears: []
    });
    setAcademicYearMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderAcademicYearScreen({
    selectedFunction: selectedAcademicYearFunction,
    academicYears: []
  });
  setAcademicYearMessage("Loading academic years...");

  try {
    const responseData = await fetchAllAcademicYears(token);
    academicYears = normalizeCollection(responseData).map(normalizeAcademicYear);
    renderAcademicYearScreen({
      selectedFunction: selectedAcademicYearFunction,
      academicYears
    });
    bindAcademicYearEvents();
    setAcademicYearMessage(
      message || `Loaded ${academicYears.length} academic year(s).`,
      type || "success"
    );
  } catch (error) {
    renderAcademicYearScreen({
      selectedFunction: selectedAcademicYearFunction,
      academicYears: []
    });
    bindAcademicYearEvents();
    setAcademicYearMessage(error.message || "Failed to load academic years.", "error");
  }
}

/**
 * Attaches event listeners to interactive elements within the Academic Year screen.
 * Binds actions for function switching (view/create/activate) and form submissions.
 * @returns {void} No return value.
 */
function bindAcademicYearEvents() {
  bindAcademicYearFunctionChange(async (nextFunction) => {
    selectedAcademicYearFunction = nextFunction;
    renderAcademicYearScreen({
      selectedFunction: selectedAcademicYearFunction,
      academicYears
    });
    bindAcademicYearEvents();
    setAcademicYearMessage("Select and run the function.");
  });

  bindCreateAcademicYearSubmit(handleCreateAcademicYearSubmit);
  bindActivateAcademicYearSubmit(handleActivateAcademicYearSubmit);
  bindActivateAcademicYearRow(handleActivateAcademicYearSubmit);
}

/**
 * Processes the submission of a new academic year.
 * Validates inputs, communicates with the backend API, and refreshes the list on success.
 * @param {string} name - The descriptive name of the new academic year (e.g., '2025/2026').
 * @returns {Promise<void>} Resolves when the creation flow completes.
 */
async function handleCreateAcademicYearSubmit(name) {
  const token = loadToken();
  if (!token) {
    setAcademicYearMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!name) {
    setAcademicYearMessage("Academic year name is required.", "error");
    return;
  }

  setAcademicYearSubmitting(true);
  setAcademicYearMessage("Creating academic year...");
  try {
    await createAcademicYear(name, token);
    await loadAcademicYearsAndRender("Academic year created successfully.", "success");
  } catch (error) {
    setAcademicYearMessage(error.message || "Failed to create academic year.", "error");
  } finally {
    setAcademicYearSubmitting(false);
  }
}

/**
 * Transmits a request to designate a specific academic year as the system-wide active session.
 * @param {string|number} academicYearId - The unique identifier of the target academic year.
 * @returns {Promise<void>} Resolves after the activation status is refreshed in the UI.
 */
async function handleActivateAcademicYearSubmit(academicYearId) {
  const token = loadToken();
  if (!token) {
    setAcademicYearMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!academicYearId) {
    setAcademicYearMessage("Select an academic year to activate.", "error");
    return;
  }

  setAcademicYearSubmitting(true);
  setAcademicYearMessage("Activating academic year...");
  try {
    await activateAcademicYear(academicYearId, token);
    await loadAcademicYearsAndRender("Academic year activated successfully.", "success");
  } catch (error) {
    setAcademicYearMessage(error.message || "Failed to activate academic year.", "error");
  } finally {
    setAcademicYearSubmitting(false);
  }
}

/**
 * Initializes the Semester management view by loading contextual academic year data.
 * Establishing the current academic year is required to manage associated semesters.
 * @returns {Promise<void>} Resolves once the semester screen is fully hydrated.
 */
async function handleSemesterTabRequested() {
  selectedSemesterFunction = "view";
  const token = loadToken();
  if (!token) {
    renderSemesterScreen({
      selectedFunction: selectedSemesterFunction,
      academicYears: [],
      selectedAcademicYearId: "",
      semesters: []
    });
    setSemesterMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderSemesterScreen({
    selectedFunction: selectedSemesterFunction,
    academicYears: [],
    selectedAcademicYearId: "",
    semesters: []
  });
  setSemesterMessage("Loading academic years...");

  try {
    const responseData = await fetchAllAcademicYears(token);
    academicYears = normalizeCollection(responseData).map(normalizeAcademicYear);
    selectedAcademicYearIdForSemesters = academicYears[0]?.academicYearId || "";
    if (selectedAcademicYearIdForSemesters) {
      semesters = await loadSemesters(selectedAcademicYearIdForSemesters, token);
    } else {
      semesters = [];
    }
    renderSemesterScreen({
      selectedFunction: selectedSemesterFunction,
      academicYears,
      selectedAcademicYearId: selectedAcademicYearIdForSemesters,
      semesters
    });
    bindSemesterEvents();
    setSemesterMessage(
      academicYears.length
        ? `Loaded ${semesters.length} semester(s).`
        : "No academic years available. Create one first.",
      academicYears.length ? "success" : "error"
    );
  } catch (error) {
    renderSemesterScreen({
      selectedFunction: selectedSemesterFunction,
      academicYears: [],
      selectedAcademicYearId: "",
      semesters: []
    });
    bindSemesterEvents();
    setSemesterMessage(error.message || "Failed to load semester context.", "error");
  }
}

/**
 * Establishes interaction logic for the Semester management interface.
 * Binds listeners for academic year selection, function switching, and semester activation.
 * @returns {void} No return value.
 */
function bindSemesterEvents() {
  bindSemesterFunctionChange((nextFunction) => {
    selectedSemesterFunction = nextFunction;
    renderSemesterScreen({
      selectedFunction: selectedSemesterFunction,
      academicYears,
      selectedAcademicYearId: selectedAcademicYearIdForSemesters,
      semesters
    });
    bindSemesterEvents();
    setSemesterMessage("Select and run the function.");
  });

  bindSemesterAcademicYearChange(async (academicYearId) => {
    selectedAcademicYearIdForSemesters = academicYearId;
    const token = loadToken();
    if (!token) {
      setSemesterMessage("Session expired. Please log in again.", "error");
      return;
    }

    if (!academicYearId) {
      semesters = [];
      renderSemesterScreen({
        selectedFunction: selectedSemesterFunction,
        academicYears,
        selectedAcademicYearId: selectedAcademicYearIdForSemesters,
        semesters
      });
      bindSemesterEvents();
      setSemesterMessage("Select an academic year.");
      return;
    }

    setSemesterMessage("Loading semesters...");
    try {
      semesters = await loadSemesters(academicYearId, token);
      renderSemesterScreen({
        selectedFunction: selectedSemesterFunction,
        academicYears,
        selectedAcademicYearId: selectedAcademicYearIdForSemesters,
        semesters
      });
      bindSemesterEvents();
      setSemesterMessage(`Loaded ${semesters.length} semester(s).`, "success");
    } catch (error) {
      semesters = [];
      renderSemesterScreen({
        selectedFunction: selectedSemesterFunction,
        academicYears,
        selectedAcademicYearId: selectedAcademicYearIdForSemesters,
        semesters
      });
      bindSemesterEvents();
      setSemesterMessage(error.message || "Failed to load semesters.", "error");
    }
  });

  bindCreateSemesterSubmit(handleCreateSemesterSubmit);
  bindActivateSemesterSubmit(handleActivateSemesterSubmit);
  bindActivateSemesterRow(handleActivateSemesterSubmit);
}

/**
 * Coordinates the addition of a new semester to the currently selected academic year.
 * @param {number} number - The sequential number of the semester (e.g., 1 or 2).
 * @returns {Promise<void>} Resolves when the new semester is saved and displayed.
 */
async function handleCreateSemesterSubmit(number) {
  const token = loadToken();
  if (!token) {
    setSemesterMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!selectedAcademicYearIdForSemesters) {
    setSemesterMessage("Select an academic year first.", "error");
    return;
  }

  if (!Number.isInteger(number) || number <= 0) {
    setSemesterMessage("Semester number must be a positive whole number.", "error");
    return;
  }

  setSemesterSubmitting(true);
  setSemesterMessage("Creating semester...");
  try {
    await createSemester(selectedAcademicYearIdForSemesters, number, token);
    semesters = await loadSemesters(selectedAcademicYearIdForSemesters, token);
    renderSemesterScreen({
      selectedFunction: selectedSemesterFunction,
      academicYears,
      selectedAcademicYearId: selectedAcademicYearIdForSemesters,
      semesters
    });
    bindSemesterEvents();
    setSemesterMessage("Semester created successfully.", "success");
  } catch (error) {
    setSemesterMessage(error.message || "Failed to create semester.", "error");
  } finally {
    setSemesterSubmitting(false);
  }
}

/**
 * Executes the activation of a specific semester within an academic year.
 * @param {string|number} semesterId - The ID of the semester to set as active.
 * @returns {Promise<void>} Resolves after the backend update and UI sync.
 */
async function handleActivateSemesterSubmit(semesterId) {
  const token = loadToken();
  if (!token) {
    setSemesterMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!semesterId) {
    setSemesterMessage("Select a semester to activate.", "error");
    return;
  }

  setSemesterSubmitting(true);
  setSemesterMessage("Activating semester...");
  try {
    await activateSemester(semesterId, token);
    if (selectedAcademicYearIdForSemesters) {
      semesters = await loadSemesters(selectedAcademicYearIdForSemesters, token);
    }
    renderSemesterScreen({
      selectedFunction: selectedSemesterFunction,
      academicYears,
      selectedAcademicYearId: selectedAcademicYearIdForSemesters,
      semesters
    });
    bindSemesterEvents();
    setSemesterMessage("Semester activated successfully.", "success");
  } catch (error) {
    setSemesterMessage(error.message || "Failed to activate semester.", "error");
  } finally {
    setSemesterSubmitting(false);
  }
}

/**
 * Internal helper to retrieve and normalize semester records for a specific academic year.
 * @param {string|number} academicYearId - The parent academic year ID.
 * @param {string} token - Security token for the API request.
 * @returns {Promise<Array<object>>} A promise resolving to a clean array of semester objects.
 */
async function loadSemesters(academicYearId, token) {
  const responseData = await fetchSemestersByAcademicYear(academicYearId, token);
  return normalizeCollection(responseData).map(normalizeSemester);
}

/**
 * Sanitizes raw academic year objects from the API into a predictable format for the view.
 * @param {object} item - The raw API record.
 * @returns {object} A normalized academic year object with consolidated keys.
 */
function normalizeAcademicYear(item) {
  const data = item && typeof item === "object" ? item : {};
  const statusText = String(data.status || data.state || "").toLowerCase();
  const isActive =
    Boolean(data.active) ||
    Boolean(data.isActive) ||
    statusText === "active" ||
    statusText === "current";
  return {
    academicYearId: String(data.academicYearId || data.id || ""),
    name: data.name || "",
    active: isActive
  };
}

/**
 * Sanitizes raw semester objects from the API into a predictable format for the view.
 * @param {object} item - The raw API record.
 * @returns {object} A normalized semester object.
 */
function normalizeSemester(item) {
  const data = item && typeof item === "object" ? item : {};
  const statusText = String(data.status || data.state || "").toLowerCase();
  const isActive =
    Boolean(data.active) ||
    Boolean(data.isActive) ||
    statusText === "active" ||
    statusText === "current";
  return {
    semesterId: String(data.semesterId || data.id || ""),
    name: data.name || `Semester ${data.number || data.semesterNumber || ""}`.trim(),
    number: data.number ?? "",
    active: isActive
  };
}

/**
 * Recursively parses JSON responses to extract arrays of academic or semester data.
 * Navigates common API response wrappers to find the actual list of items.
 * @param {*} responseData - The raw response from an internal or external API.
 * @returns {Array<object>} A flat array of relevant records.
 */
function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = ["data", "content", "items", "results", "academicYears", "semesters"];
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

  if (responseData.academicYearId || responseData.semesterId || responseData.name) {
    return [responseData];
  }

  return [];
}
