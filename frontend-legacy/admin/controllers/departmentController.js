/**
 * @fileoverview Administrative controller for managing Academic Departments.
 * Handles the creation, lookup, and updates of departments within specific schools.
 * Manages soft-deleted departments and viewing associated academic programs.
 * @module admin/controllers/departmentController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import { fetchProgramById, fetchProgramsByDepartment } from "../models/programModel.js";
import { openProgramActionsFromContext } from "./programController.js";
import {
  createDepartment,
  deleteDepartment,
  fetchAllDepartmentsBySchool,
  fetchAllDeletedDepartmentsBySchool,
  fetchAllSchoolsForDepartments,
  restoreDeletedDepartment,
  updateDepartment
} from "../models/departmentModel.js";
import {
  bindDepartmentProgramsActions,
  bindDeletedDepartmentRestore,
  bindDeletedDepartmentSchoolFilter,
  bindDepartmentModalActions,
  bindDepartmentSchoolFilter,
  bindDepartmentSelect,
  bindDepartmentsSearch,
  bindCreateDepartmentSubmit,
  bindCreateDepartmentTriggers,
  bindViewDeletedDepartmentsTrigger,
  bindViewAllDepartmentsTrigger,
  closeDepartmentModal,
  openDepartmentModal,
  openDepartmentProgramsModal,
  renderCreatedDepartmentDetails,
  renderCreateDepartmentForm,
  renderSelectedDepartmentProgramDetails,
  renderDeletedDepartmentsScreen,
  renderDepartmentsScreen,
  setDepartmentModalMessage,
  setDepartmentModalSubmitting,
  setCreateDepartmentMessage,
  setCreateDepartmentSubmitting,
  setDepartmentsMessage
} from "../views/departmentView.js";

let allSchools = [];
let allDepartments = [];
let selectedSchoolId = "";
let allDeletedDepartments = [];
let selectedDepartment = null;
let selectedDepartmentPrograms = [];

/**
 * Initializes the department controller by establishing primary UI triggers.
 * Sets up listeners for the creation workflow, general listing, and deleted records recovery.
 * @returns {void} No return value.
 */
export function initDepartmentController() {
  bindCreateDepartmentTriggers(handleCreateDepartmentRequested);
  bindViewAllDepartmentsTrigger(handleViewAllDepartmentsRequested);
  bindViewDeletedDepartmentsTrigger(handleViewDeletedDepartmentsRequested);
}

/**
 * Initiates the 'Create Department' workflow.
 * Fetches available schools to populate the creation context.
 * @returns {Promise<void>} Resolves when the creation form is rendered.
 */
async function handleCreateDepartmentRequested() {
  const token = loadToken();
  renderCreateDepartmentForm([]);
  renderCreatedDepartmentDetails(null);

  if (!token) {
    setCreateDepartmentMessage("Session expired. Please log in again.", "error");
    return;
  }

  setCreateDepartmentMessage("Loading schools...");

  try {
    const schoolsResponse = await fetchAllSchoolsForDepartments(token);
    const schools = normalizeCollection(schoolsResponse);
    renderCreateDepartmentForm(schools);
    renderCreatedDepartmentDetails(null);
    setCreateDepartmentMessage(
      schools.length > 0 ? "Select a school and fill department details." : "No schools available.",
      schools.length > 0 ? "" : "error"
    );
    bindCreateDepartmentSubmit(handleCreateDepartmentSubmit);
  } catch (error) {
    renderCreateDepartmentForm([]);
    renderCreatedDepartmentDetails(null);
    setCreateDepartmentMessage(error.message || "Failed to load schools.", "error");
    console.error("Load schools for department creation failed:", error);
  }
}

/**
 * Processes the final submission produced by the department creation form.
 * @param {object} payload - The department data (schoolId, name, and departmental code).
 * @returns {Promise<void>} Resolves when the department is saved and feedback is provided.
 */
async function handleCreateDepartmentSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setCreateDepartmentMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.schoolId || !payload.name || !payload.code) {
    setCreateDepartmentMessage("School, department name, and department code are required.", "error");
    return;
  }

  setCreateDepartmentSubmitting(true);
  setCreateDepartmentMessage("");

  try {
    const createdDepartment = await createDepartment(
      payload.schoolId,
      { name: payload.name, code: payload.code },
      token
    );
    setCreateDepartmentMessage("Department created successfully.", "success");
    renderCreatedDepartmentDetails(createdDepartment);
  } catch (error) {
    setCreateDepartmentMessage(error.message || "Failed to create department.", "error");
    renderCreatedDepartmentDetails(null);
    console.error("Create department failed:", error);
  } finally {
    setCreateDepartmentSubmitting(false);
  }
}

/**
 * Navigates the administrator to the primary Department management screen.
 * Prepares the environment by loading the initial school filter list.
 * @returns {Promise<void>} Resolves when the screen is ready for user interaction.
 */
async function handleViewAllDepartmentsRequested() {
  const token = loadToken();
  if (!token) {
    renderDepartmentsScreen([], [], "");
    setDepartmentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderDepartmentsScreen([], [], "");
  setDepartmentsMessage("Loading schools...");

  try {
    const schoolsResponse = await fetchAllSchoolsForDepartments(token);
    allSchools = normalizeCollection(schoolsResponse);
    selectedSchoolId = "";
    allDepartments = [];

    renderDepartmentsScreen(allDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage("Select a school to load departments.");
    bindDepartmentsEvents();
  } catch (error) {
    renderDepartmentsScreen([], [], "");
    setDepartmentsMessage(error.message || "Failed to load schools.", "error");
    console.error("Load schools for departments failed:", error);
  }
}

/**
 * Transitions the view to manage soft-deleted departments.
 * @returns {Promise<void>} Resolves after loading contextual school data.
 */
async function handleViewDeletedDepartmentsRequested() {
  const token = loadToken();
  if (!token) {
    renderDeletedDepartmentsScreen([], [], "");
    setDepartmentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderDeletedDepartmentsScreen([], [], "");
  setDepartmentsMessage("Loading schools...");

  try {
    const schoolsResponse = await fetchAllSchoolsForDepartments(token);
    allSchools = normalizeCollection(schoolsResponse);
    selectedSchoolId = "";
    allDeletedDepartments = [];

    renderDeletedDepartmentsScreen(allDeletedDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage("Select a school to load deleted departments.");
    bindDeletedDepartmentsEvents();
  } catch (error) {
    renderDeletedDepartmentsScreen([], [], "");
    setDepartmentsMessage(error.message || "Failed to load schools.", "error");
    console.error("Load schools for deleted departments failed:", error);
  }
}

/**
 * Binds bind departments events.
 * @returns {void}
 */
function bindDepartmentsEvents() {
  bindDepartmentSchoolFilter(handleDepartmentSchoolChanged);
  bindDepartmentsSearch(handleDepartmentsSearch);
  bindDepartmentSelect(handleDepartmentSelected);
}

/**
 * Binds bind deleted departments events.
 * @returns {void}
 */
function bindDeletedDepartmentsEvents() {
  bindDeletedDepartmentSchoolFilter(handleDeletedDepartmentSchoolChanged);
  bindDeletedDepartmentRestore(handleDeletedDepartmentRestore);
}

/**
 * Responds to a change in the school filter within the department list.
 * Triggers a refresh of the department collection for the newly selected school.
 * @param {string|number} schoolId - The unique ID of the target school.
 * @returns {Promise<void>} Resolves when the filtered list is rendered.
 */
async function handleDepartmentSchoolChanged(schoolId) {
  selectedSchoolId = schoolId;
  allDepartments = [];

  if (!schoolId) {
    renderDepartmentsScreen(allDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage("Select a school to load departments.");
    bindDepartmentsEvents();
    return;
  }

  const token = loadToken();
  if (!token) {
    setDepartmentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderDepartmentsScreen([], allSchools, selectedSchoolId);
  setDepartmentsMessage("Loading departments...");
  bindDepartmentsEvents();

  try {
    const departmentsResponse = await fetchAllDepartmentsBySchool(schoolId, token);
    allDepartments = normalizeCollection(departmentsResponse);
    renderDepartmentsScreen(allDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage(`Loaded ${allDepartments.length} department(s).`, "success");
    bindDepartmentsEvents();
  } catch (error) {
    allDepartments = [];
    renderDepartmentsScreen(allDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage(error.message || "Failed to load departments.", "error");
    bindDepartmentsEvents();
    console.error("Load departments failed:", error);
  }
}

/**
 * Handles handle deleted department school changed.
 * @param {string|number} schoolId
 * @returns {Promise<*>}
 */
async function handleDeletedDepartmentSchoolChanged(schoolId) {
  selectedSchoolId = schoolId;
  allDeletedDepartments = [];

  if (!schoolId) {
    renderDeletedDepartmentsScreen(allDeletedDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage("Select a school to load deleted departments.");
    bindDeletedDepartmentsEvents();
    return;
  }

  const token = loadToken();
  if (!token) {
    setDepartmentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderDeletedDepartmentsScreen([], allSchools, selectedSchoolId);
  setDepartmentsMessage("Loading deleted departments...");
  bindDeletedDepartmentsEvents();

  try {
    const departmentsResponse = await fetchAllDeletedDepartmentsBySchool(schoolId, token);
    allDeletedDepartments = normalizeCollection(departmentsResponse);
    renderDeletedDepartmentsScreen(allDeletedDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage(`Loaded ${allDeletedDepartments.length} deleted department(s).`, "success");
    bindDeletedDepartmentsEvents();
  } catch (error) {
    allDeletedDepartments = [];
    renderDeletedDepartmentsScreen(allDeletedDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage(error.message || "Failed to load deleted departments.", "error");
    bindDeletedDepartmentsEvents();
    console.error("Load deleted departments failed:", error);
  }
}

/**
 * Executes a client-side keyword search across the currently loaded department list.
 * Filters by department name, code, or associated school details.
 * @param {string} query - The search term.
 * @returns {void} Updates the UI with filtered results.
 */
function handleDepartmentsSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    renderDepartmentsScreen(allDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage(`Loaded ${allDepartments.length} department(s).`, "success");
    bindDepartmentsEvents();
    return;
  }

  const filteredDepartments = allDepartments.filter((department) => {
    const schoolMatch = String(
      department.schoolName || department.schoolCode || department.schoolId || ""
    )
      .toLowerCase()
      .includes(normalizedQuery);
    const nameMatch = String(department.name || "")
      .toLowerCase()
      .includes(normalizedQuery);
    const codeMatch = String(department.code || "")
      .toLowerCase()
      .includes(normalizedQuery);

    return schoolMatch || nameMatch || codeMatch;
  });

  renderDepartmentsScreen(filteredDepartments, allSchools, selectedSchoolId);
  setDepartmentsMessage(`Search returned ${filteredDepartments.length} department(s).`, "success");
  bindDepartmentsEvents();
}

/**
 * Reacts to a user selection from the department list, launching the management modal.
 * @param {string|number} departmentId - The ID of the selected department.
 * @returns {void} Opens the department details and actions modal.
 */
function handleDepartmentSelected(departmentId) {
  selectedDepartment = allDepartments.find(
    (department) => String(department.id) === String(departmentId)
  );

  if (!selectedDepartment) {
    setDepartmentsMessage("Selected department was not found in loaded results.", "error");
    return;
  }

  openDepartmentModal(selectedDepartment);
  bindDepartmentModalActions({
    onUpdate: handleDepartmentUpdate,
    onDelete: handleDepartmentDelete,
    onViewPrograms: handleDepartmentViewProgramsRequested
  });
}

/**
 * Retrieves and displays all academic programs hosted by a specific department.
 * Transitions the UI into a secondary programs-focused modal view.
 * @param {string|number} _schoolId - Placeholder for school context.
 * @param {string|number} departmentId - The target department.
 * @returns {Promise<void>} Resolves after the programs are loaded and displayed.
 */
async function handleDepartmentViewProgramsRequested(_schoolId, departmentId) {
  const token = loadToken();
  if (!token) {
    setDepartmentModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  const currentDepartment =
    selectedDepartment &&
      String(selectedDepartment.id) === String(departmentId)
      ? selectedDepartment
      : allDepartments.find((department) => String(department.id) === String(departmentId));

  if (!currentDepartment) {
    setDepartmentModalMessage("Selected department was not found.", "error");
    return;
  }

  try {
    const programsResponse = await fetchProgramsByDepartment(departmentId, token);
    selectedDepartmentPrograms = normalizeCollection(programsResponse);
    openDepartmentProgramsModal(currentDepartment, selectedDepartmentPrograms);
    bindDepartmentProgramsActions({
      onProgramSelect: handleDepartmentProgramSelected,
      onBack: () => {
        openDepartmentModal(currentDepartment);
        bindDepartmentModalActions({
          onUpdate: handleDepartmentUpdate,
          onDelete: handleDepartmentDelete,
          onViewPrograms: handleDepartmentViewProgramsRequested
        });
      }
    });
  } catch (error) {
    setDepartmentModalMessage(error.message || "Failed to load department programs.", "error");
    console.error("Load department programs failed:", error);
  }
}

/**
 * Navigates into a detailed view for a specific program found within a department.
 * Triggers the program controller to handle specialized program actions.
 * @param {string|number} programId - The ID of the program to examine.
 * @returns {Promise<void>} Resolves once the program workflow is handed off.
 */
async function handleDepartmentProgramSelected(programId) {
  let selectedProgram = selectedDepartmentPrograms.find(
    (program) => String(program.id || program.programId) === String(programId)
  );

  const token = loadToken();
  if (!token) {
    setDepartmentsMessage("Session expired. Please log in again.", "error");
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

  const currentDepartment = selectedDepartment;
  try {
    closeDepartmentModal();
    await openProgramActionsFromContext(selectedProgram, {
      onClose: () => {
        if (!currentDepartment) {
          return;
        }

        openDepartmentProgramsModal(currentDepartment, selectedDepartmentPrograms);
        bindDepartmentProgramsActions({
          onProgramSelect: handleDepartmentProgramSelected,
          onBack: () => {
            openDepartmentModal(currentDepartment);
            bindDepartmentModalActions({
              onUpdate: handleDepartmentUpdate,
              onDelete: handleDepartmentDelete,
              onViewPrograms: handleDepartmentViewProgramsRequested
            });
          }
        });
      }
    });
  } catch (error) {
    renderSelectedDepartmentProgramDetails(selectedProgram);
    setDepartmentsMessage(error.message || "Failed to open program actions.", "error");
  }
}

/**
 * Transmits a request to update a department's core metadata (name or code).
 * Synchronizes local state with the server's update confirmation.
 * @param {string|number} schoolId - Parent school context.
 * @param {string|number} departmentId - Specific department to update.
 * @param {object} payload - New field values.
 * @returns {Promise<void>} Resolves when the UI is refreshed with updated info.
 */
async function handleDepartmentUpdate(schoolId, departmentId, payload) {
  const token = loadToken();
  if (!token) {
    setDepartmentModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.name || !payload.code) {
    setDepartmentModalMessage("Department name and code are required.", "error");
    return;
  }

  setDepartmentModalSubmitting(true);
  setDepartmentModalMessage("");

  try {
    const apiResponse = await updateDepartment(schoolId, departmentId, payload, token);
    const updatedDepartment = normalizeUpdatedDepartment(
      schoolId,
      departmentId,
      apiResponse,
      payload
    );

    allDepartments = allDepartments.map((department) =>
      String(department.id) === String(departmentId) ? updatedDepartment : department
    );

    renderDepartmentsScreen(allDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage("Department updated successfully.", "success");
    bindDepartmentsEvents();

    openDepartmentModal(updatedDepartment);
    selectedDepartment = updatedDepartment;
    bindDepartmentModalActions({
      onUpdate: handleDepartmentUpdate,
      onDelete: handleDepartmentDelete,
      onViewPrograms: handleDepartmentViewProgramsRequested
    });
    setDepartmentModalMessage("Department updated successfully.", "success");
  } catch (error) {
    setDepartmentModalMessage(error.message || "Failed to update department.", "error");
    console.error("Update department failed:", error);
  } finally {
    setDepartmentModalSubmitting(false);
  }
}

/**
 * Performs a soft-delete of a department record.
 * @param {string|number} schoolId - Parent school ID.
 * @param {string|number} departmentId - Department to be removed.
 * @returns {Promise<void>} Resolves after the department is purged from the active list.
 */
async function handleDepartmentDelete(schoolId, departmentId) {
  const token = loadToken();
  if (!token) {
    setDepartmentModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  setDepartmentModalSubmitting(true);
  setDepartmentModalMessage("");

  try {
    await deleteDepartment(schoolId, departmentId, token);
    allDepartments = allDepartments.filter(
      (department) => String(department.id) !== String(departmentId)
    );

    closeDepartmentModal();
    renderDepartmentsScreen(allDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage("Department deleted successfully.", "success");
    bindDepartmentsEvents();
  } catch (error) {
    setDepartmentModalMessage(error.message || "Failed to delete department.", "error");
    console.error("Delete department failed:", error);
  } finally {
    setDepartmentModalSubmitting(false);
  }
}

/**
 * Restores a previously soft-deleted department to an active state.
 * @param {string|number} schoolId - Parent school.
 * @param {string|number} departmentId - The department to recover.
 * @returns {Promise<void>} Resolves after the restored item is removed from the deleted list.
 */
async function handleDeletedDepartmentRestore(schoolId, departmentId) {
  const token = loadToken();
  if (!token) {
    setDepartmentsMessage("Session expired. Please log in again.", "error");
    return;
  }

  try {
    await restoreDeletedDepartment(schoolId, departmentId, token);
    allDeletedDepartments = allDeletedDepartments.filter(
      (department) => String(department.id) !== String(departmentId)
    );

    renderDeletedDepartmentsScreen(allDeletedDepartments, allSchools, selectedSchoolId);
    setDepartmentsMessage("Department restored successfully.", "success");
    bindDeletedDepartmentsEvents();
  } catch (error) {
    setDepartmentsMessage(error.message || "Failed to restore department.", "error");
    console.error("Restore department failed:", error);
  }
}

/**
 * Standardizes various API response formats into a flat array of department objects.
 * Self-navigates common JSON wrappers autonomously.
 * @param {*} responseData - Raw server response data.
 * @returns {Array<object>} A clean list of department entries.
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
 * Normalizes normalize updated department.
 * @param {string|number} schoolId
 * @param {string|number} departmentId
 * @param {*} apiResponse
 * @param {object} fallbackPayload
 * @returns {*}
 */
function normalizeUpdatedDepartment(schoolId, departmentId, apiResponse, fallbackPayload) {
  const responseData = apiResponse && typeof apiResponse === "object" ? apiResponse : {};
  return {
    ...responseData,
    id: responseData.id || departmentId,
    schoolId: responseData.schoolId || schoolId,
    name: responseData.name || fallbackPayload.name,
    code: responseData.code || fallbackPayload.code
  };
}
