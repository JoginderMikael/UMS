/**
 * @fileoverview Administrative controller for managing University Schools.
 * Coordinates school creation, updates, and deletion. Provides oversight for
 * soft-deleted schools and bridges the navigation to program-specific management.
 * @module admin/controllers/schoolController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import { fetchProgramById, fetchProgramsBySchool } from "../models/programModel.js";
import { openProgramActionsFromContext } from "./programController.js";
import {
  createSchool,
  deleteSchool,
  fetchAllDeletedSchools,
  fetchAllSchools,
  restoreDeletedSchool,
  updateSchool
} from "../models/schoolModel.js";
import {
  bindSchoolProgramsActions,
  bindDeletedSchoolRestore,
  openSchoolProgramsModal,
  renderSelectedSchoolProgramDetails,
  bindSchoolModalActions,
  bindSchoolSelect,
  bindSchoolsSearch,
  bindCreateSchoolSubmit,
  bindCreateSchoolTriggers,
  bindViewDeletedSchoolsTrigger,
  bindViewAllSchoolsTrigger,
  closeSchoolModal,
  openSchoolModal,
  renderCreatedSchoolDetails,
  renderCreateSchoolForm,
  renderDeletedSchoolsScreen,
  renderSchoolsScreen,
  setCreateSchoolMessage,
  setCreateSchoolSubmitting,
  setSchoolModalMessage,
  setSchoolModalSubmitting,
  setSchoolsMessage
} from "../views/schoolView.js";

let allSchools = [];
let deletedSchools = [];
let selectedSchool = null;
let selectedSchoolPrograms = [];

/**
 * Initializes the school controller by binding primary UI triggers.
 * Sets up listeners for creation, viewing active schools, and recovery of deleted records.
 * @returns {void} No return value.
 */
export function initSchoolController() {
  bindCreateSchoolTriggers(handleCreateSchoolRequested);
  bindViewAllSchoolsTrigger(handleViewAllSchoolsRequested);
  bindViewDeletedSchoolsTrigger(handleViewDeletedSchoolsRequested);
}

/**
 * Transitions the UI to the school creation workflow.
 * @returns {void} No return value.
 */
function handleCreateSchoolRequested() {
  renderCreateSchoolForm();
  renderCreatedSchoolDetails(null);
  setCreateSchoolMessage("");
  bindCreateSchoolSubmit(handleCreateSchoolSubmit);
}

/**
 * Processes the submission of a new school record.
 * @param {object} payload - Metadata for the new school (name and school code).
 * @returns {Promise<void>} Resolves when the school is saved and feedback is provided.
 */
async function handleCreateSchoolSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setCreateSchoolMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.name || !payload.code) {
    setCreateSchoolMessage("School name and school code are required.", "error");
    return;
  }

  setCreateSchoolSubmitting(true);
  setCreateSchoolMessage("");

  try {
    const createdSchool = await createSchool(payload, token);
    setCreateSchoolMessage("School created successfully.", "success");
    renderCreatedSchoolDetails(createdSchool);
  } catch (error) {
    setCreateSchoolMessage(error.message || "Failed to create school.", "error");
    renderCreatedSchoolDetails(null);
    console.error("Create school failed:", error);
  } finally {
    setCreateSchoolSubmitting(false);
  }
}

/**
 * Loads and displays the complete list of all active university schools.
 * @returns {Promise<void>} Resolves once the school grid is rendered.
 */
async function handleViewAllSchoolsRequested() {
  const token = loadToken();
  if (!token) {
    renderSchoolsScreen([]);
    setSchoolsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderSchoolsScreen([]);
  setSchoolsMessage("Loading schools...");

  try {
    const responseData = await fetchAllSchools(token);
    allSchools = normalizeCollection(responseData);
    renderSchoolsScreen(allSchools);
    setSchoolsMessage(`Loaded ${allSchools.length} school(s).`, "success");
    bindSchoolsEvents();
  } catch (error) {
    renderSchoolsScreen([]);
    setSchoolsMessage(error.message || "Failed to load schools.", "error");
    console.error("View schools failed:", error);
  }
}

/**
 * Transitions the view to manage soft-deleted schools available for restoration.
 * @returns {Promise<void>} Resolves after the deleted schools list is loaded and rendered.
 */
async function handleViewDeletedSchoolsRequested() {
  const token = loadToken();
  if (!token) {
    renderDeletedSchoolsScreen([]);
    setSchoolsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderDeletedSchoolsScreen([]);
  setSchoolsMessage("Loading deleted schools...");

  try {
    const responseData = await fetchAllDeletedSchools(token);
    deletedSchools = normalizeCollection(responseData);
    renderDeletedSchoolsScreen(deletedSchools);
    setSchoolsMessage(`Loaded ${deletedSchools.length} deleted school(s).`, "success");
    bindDeletedSchoolsEvents();
  } catch (error) {
    renderDeletedSchoolsScreen([]);
    setSchoolsMessage(error.message || "Failed to load deleted schools.", "error");
    console.error("View deleted schools failed:", error);
  }
}

/**
 * Binds bind schools events.
 * @returns {void}
 */
function bindSchoolsEvents() {
  bindSchoolsSearch(handleSchoolsSearch);
  bindSchoolSelect(handleSchoolSelected);
}

/**
 * Binds bind deleted schools events.
 * @returns {void}
 */
function bindDeletedSchoolsEvents() {
  bindDeletedSchoolRestore(handleDeletedSchoolRestore);
}

/**
 * Executes a keyword search across the currently loaded school list.
 * Searches across name, school code, and unique identifiers.
 * @param {string} query - The search term.
 * @returns {void} Updates the UI with search results.
 */
function handleSchoolsSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    renderSchoolsScreen(allSchools);
    setSchoolsMessage(`Loaded ${allSchools.length} school(s).`, "success");
    bindSchoolsEvents();
    return;
  }

  const filteredSchools = allSchools.filter((school) => {
    const idMatch = String(school.id || school.schoolId || "")
      .toLowerCase()
      .includes(normalizedQuery);
    const nameMatch = String(school.name || school.schoolName || "")
      .toLowerCase()
      .includes(normalizedQuery);
    const codeMatch = String(school.code || school.schoolCode || "")
      .toLowerCase()
      .includes(normalizedQuery);

    return idMatch || nameMatch || codeMatch;
  });

  renderSchoolsScreen(filteredSchools);
  setSchoolsMessage(`Search returned ${filteredSchools.length} school(s).`, "success");
  bindSchoolsEvents();
}

/**
 * Reacts to a school selection from the list, launching the management modal.
 * @param {string|number} schoolId - Unique identifier of the selected school.
 * @returns {void} Opens the school details and actions modal.
 */
function handleSchoolSelected(schoolId) {
  selectedSchool = allSchools.find(
    (school) => String(school.id || school.schoolId) === String(schoolId)
  );

  if (!selectedSchool) {
    setSchoolsMessage("Selected school was not found in the loaded results.", "error");
    return;
  }

  openSchoolModal(selectedSchool);
  bindSchoolModalActions({
    onUpdate: handleSchoolUpdate,
    onDelete: handleSchoolDelete,
    onViewPrograms: handleSchoolViewProgramsRequested
  });
}

/**
 * Retrieves and displays all academic programs housed within a specific school.
 * Transitions the UI into a program-focused modal overview.
 * @param {string|number} schoolId - The target school.
 * @returns {Promise<void>} Resolves after programs are loaded and displayed.
 */
async function handleSchoolViewProgramsRequested(schoolId) {
  const token = loadToken();
  if (!token) {
    setSchoolModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  const currentSchool =
    selectedSchool &&
      String(selectedSchool.id || selectedSchool.schoolId) === String(schoolId)
      ? selectedSchool
      : allSchools.find((school) => String(school.id || school.schoolId) === String(schoolId));

  if (!currentSchool) {
    setSchoolModalMessage("Selected school was not found.", "error");
    return;
  }

  try {
    const programsResponse = await fetchProgramsBySchool(schoolId, token);
    selectedSchoolPrograms = normalizeCollection(programsResponse);
    openSchoolProgramsModal(currentSchool, selectedSchoolPrograms);
    bindSchoolProgramsActions({
      onProgramSelect: handleSchoolProgramSelected,
      onBack: () => {
        openSchoolModal(currentSchool);
        bindSchoolModalActions({
          onUpdate: handleSchoolUpdate,
          onDelete: handleSchoolDelete,
          onViewPrograms: handleSchoolViewProgramsRequested
        });
      }
    });
  } catch (error) {
    setSchoolModalMessage(error.message || "Failed to load school programs.", "error");
    console.error("Load school programs failed:", error);
  }
}

/**
 * Navigates into a detailed program management workflow for a program found within a school.
 * Hands off control to the program controller with a custom close callback.
 * @param {string|number} programId - The program to focus on.
 * @returns {Promise<void>} Resolves when the program management experience is launched.
 */
async function handleSchoolProgramSelected(programId) {
  let selectedProgram = selectedSchoolPrograms.find(
    (program) => String(program.id || program.programId) === String(programId)
  );

  const token = loadToken();
  if (!token) {
    setSchoolsMessage("Session expired. Please log in again.", "error");
    return;
  }

  try {
    const detailsResponse = await fetchProgramById(programId, token);
    if (detailsResponse && typeof detailsResponse === "object") {
      selectedProgram = {
        ...selectedProgram,
        ...detailsResponse,
        id: selectedProgram?.id || selectedProgram?.programId || detailsResponse.id || programId
      };
    }
  } catch {
    // Keep minimal program data if details endpoint fails.
  }

  const currentSchool = selectedSchool;
  try {
    closeSchoolModal();
    await openProgramActionsFromContext(selectedProgram, {
      onClose: () => {
        if (!currentSchool) {
          return;
        }

        openSchoolProgramsModal(currentSchool, selectedSchoolPrograms);
        bindSchoolProgramsActions({
          onProgramSelect: handleSchoolProgramSelected,
          onBack: () => {
            openSchoolModal(currentSchool);
            bindSchoolModalActions({
              onUpdate: handleSchoolUpdate,
              onDelete: handleSchoolDelete,
              onViewPrograms: handleSchoolViewProgramsRequested
            });
          }
        });
      }
    });
  } catch (error) {
    renderSelectedSchoolProgramDetails(selectedProgram);
    setSchoolsMessage(error.message || "Failed to open program actions.", "error");
  }
}

/**
 * Submits an update to a school's core metadata (name or code).
 * Synchronizes the local list state and refreshes the management modal.
 * @param {string|number} schoolId - The ID of the school to update.
 * @param {object} payload - New metadata values.
 * @returns {Promise<void>} Resolves once the UI reflects the updated information.
 */
async function handleSchoolUpdate(schoolId, payload) {
  const token = loadToken();
  if (!token) {
    setSchoolModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.name || !payload.code) {
    setSchoolModalMessage("School name and school code are required.", "error");
    return;
  }

  setSchoolModalSubmitting(true);
  setSchoolModalMessage("");

  try {
    const apiResponse = await updateSchool(schoolId, payload, token);
    const updatedSchool = normalizeUpdatedSchool(schoolId, apiResponse, payload);

    allSchools = allSchools.map((school) =>
      String(school.id || school.schoolId) === String(schoolId) ? updatedSchool : school
    );

    renderSchoolsScreen(allSchools);
    setSchoolsMessage("School updated successfully.", "success");
    bindSchoolsEvents();

    openSchoolModal(updatedSchool);
    selectedSchool = updatedSchool;
    bindSchoolModalActions({
      onUpdate: handleSchoolUpdate,
      onDelete: handleSchoolDelete,
      onViewPrograms: handleSchoolViewProgramsRequested
    });
    setSchoolModalMessage("School updated successfully.", "success");
  } catch (error) {
    setSchoolModalMessage(error.message || "Failed to update school.", "error");
    console.error("Update school failed:", error);
  } finally {
    setSchoolModalSubmitting(false);
  }
}

/**
 * Performs a soft-delete of a school record after clearing the management modal.
 * @param {string|number} schoolId - The school to be removed.
 * @returns {Promise<void>} Resolves once the school is removed from the active list.
 */
async function handleSchoolDelete(schoolId) {
  const token = loadToken();
  if (!token) {
    setSchoolModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  setSchoolModalSubmitting(true);
  setSchoolModalMessage("");

  try {
    await deleteSchool(schoolId, token);
    allSchools = allSchools.filter(
      (school) => String(school.id || school.schoolId) !== String(schoolId)
    );

    closeSchoolModal();
    renderSchoolsScreen(allSchools);
    setSchoolsMessage("School deleted successfully.", "success");
    bindSchoolsEvents();
  } catch (error) {
    setSchoolModalMessage(error.message || "Failed to delete school.", "error");
    console.error("Delete school failed:", error);
  } finally {
    setSchoolModalSubmitting(false);
  }
}

/**
 * Restores a previously soft-deleted school to an active state.
 * @param {string|number} schoolId - The ID of the school to recover.
 * @returns {Promise<void>} Resolves after the restored item is removed from the deleted list.
 */
async function handleDeletedSchoolRestore(schoolId) {
  const token = loadToken();
  if (!token) {
    setSchoolsMessage("Session expired. Please log in again.", "error");
    return;
  }

  try {
    await restoreDeletedSchool(schoolId, token);
    deletedSchools = deletedSchools.filter(
      (school) => String(school.id || school.schoolId) !== String(schoolId)
    );
    renderDeletedSchoolsScreen(deletedSchools);
    setSchoolsMessage("School restored successfully.", "success");
    bindDeletedSchoolsEvents();
  } catch (error) {
    setSchoolsMessage(error.message || "Failed to restore school.", "error");
    console.error("Restore school failed:", error);
  }
}

/**
 * Standardizes various API response formats into a flat array of school objects.
 * Navigates common university API JSON wrappers.
 * @param {*} responseData - Raw server response data.
 * @returns {Array<object>} A clean list of school entries.
 */
function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = ["data", "schools", "content", "items", "results"];
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

  if (responseData.id || responseData.schoolId || responseData.name || responseData.code) {
    return [responseData];
  }

  return [];
}

/**
 * Orchestrates the merge of API update responses with existing school state.
 * Ensures data consistency across the application when a single field is updated.
 * @param {string|number} schoolId - Targeted school.
 * @param {object} apiResponse - Response from the update endpoint.
 * @param {object} fallbackPayload - The original update request if the API response is partial.
 * @returns {object} A fully updated school record.
 */
function normalizeUpdatedSchool(schoolId, apiResponse, fallbackPayload) {
  const responseData = apiResponse && typeof apiResponse === "object" ? apiResponse : {};
  return {
    ...responseData,
    id: responseData.id || schoolId,
    name: responseData.name || fallbackPayload.name,
    code: responseData.code || fallbackPayload.code
  };
}
