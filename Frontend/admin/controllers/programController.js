/**
 * @fileoverview Administrative controller for managing Academic Programs.
 * This complex module coordinates program lifecycle management, including creation,
 * school/department association, curriculum mapping (courses), and detailed lookups.
 * @module admin/controllers/programController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import {
  addCourseToProgram,
  createProgram,
  deleteProgram,
  fetchAllProgramsMinimal,
  fetchAllSchoolsForPrograms,
  fetchCoursesBySchool,
  fetchDepartmentsBySchoolForPrograms,
  fetchProgramById,
  fetchProgramsByDepartment,
  fetchProgramsBySchool,
  fetchProgramCourses,
  removeCourseFromProgram,
  updateProgramCourseAssociation,
  updateProgram
} from "../models/programModel.js";
import {
  bindAddCourseToProgramForm,
  bindCreateProgramSubmit,
  bindCreateProgramTriggers,
  bindProgramCourseSchoolChange,
  bindProgramCoursesClose,
  bindProgramCourseSelect,
  bindProgramDetailsActions,
  bindProgramDetailsTabTrigger,
  bindProgramFullDetailsActions,
  bindProgramLookupFilters,
  bindProgramSchoolChange,
  bindProgramSelect,
  bindProgramUpdateForm,
  bindSelectedProgramCourseActions,
  bindViewAllProgramsTrigger,
  bindProgramCourseEditModal,
  closeProgramCourseEditModal,
  hideSelectedProgramCourseActions,
  openProgramCourseEditModal,
  renderAddCourseToProgramForm,
  renderCreatedProgramDetails,
  renderCreateProgramForm,
  renderProgramCoursesScreen,
  renderProgramDetailsScreen,
  renderProgramFullDetailsScreen,
  renderProgramLookupScreen,
  renderProgramUpdateForm,
  renderProgramsScreen,
  renderSelectedProgramCourseActions,
  setAddCourseToProgramMessage,
  setAddCourseToProgramSubmitting,
  setCreateProgramMessage,
  setCreateProgramSubmitting,
  setProgramCoursesMessage,
  setProgramDetailsMessage,
  setProgramFullDetailsMessage,
  setProgramLookupMessage,
  setProgramCourseOptions,
  setProgramCourseEditModalMessage,
  setProgramCourseEditModalSubmitting,
  setProgramsMessage,
  setProgramDepartmentOptions,
  setSelectedProgramCourseMessage,
  setUpdateProgramMessage,
  setUpdateProgramSubmitting
} from "../views/programView.js";

let schoolsCache = [];
const departmentsCacheBySchoolId = new Map();
const coursesCacheBySchoolId = new Map();
let allPrograms = [];
let selectedProgramCourses = [];
let selectedProgramYear = 1;
let programLookupSchools = [];
let programLookupDepartments = [];
let programLookupPrograms = [];
let selectedLookupSchoolId = "";
let selectedLookupDepartmentId = "";
let currentProgramListView = "all";
let externalProgramCloseHandler = null;

/**
 * Initializes the program controller by binding primary management triggers.
 * Sets up listeners for program creation, bulk viewing, and detailed lookup tabs.
 * @returns {void} No return value.
 */
export function initProgramController() {
  bindCreateProgramTriggers(handleCreateProgramRequested);
  bindViewAllProgramsTrigger(handleViewAllProgramsRequested);
  bindProgramDetailsTabTrigger(handleProgramDetailsTabRequested);
}

/**
 * Transitions into the program management experience from an external or contextual trigger.
 * Merges the provided program record into the local state and launches the action screen.
 * @param {object} program - The program entity to focus on.
 * @param {object} [options={}] - Navigation options, including 'onClose' hooks.
 * @returns {Promise<void>} Resolves when the program management UI is prepared.
 */
export async function openProgramActionsFromContext(program, options = {}) {
  const token = loadToken();
  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  const normalizedProgram = await ensureProgramActionRecord(program, token);
  if (!normalizedProgram?.id) {
    throw new Error("Selected program is missing an ID.");
  }

  const index = allPrograms.findIndex((item) => String(item.id) === String(normalizedProgram.id));
  if (index >= 0) {
    allPrograms[index] = { ...allPrograms[index], ...normalizedProgram };
  } else {
    allPrograms = [...allPrograms, normalizedProgram];
  }

  currentProgramListView = "external";
  externalProgramCloseHandler =
    typeof options.onClose === "function" ? options.onClose : null;

  openProgramActionScreen(normalizedProgram);
}

/**
 * Initiates the 'Create Program' workflow.
 * Loads the prerequisite list of schools to populate the initial creation context.
 * @returns {Promise<void>} Resolves when the creation form is rendered.
 */
async function handleCreateProgramRequested() {
  renderCreateProgramForm({ schools: [], departments: [] });
  renderCreatedProgramDetails(null);

  const token = loadToken();
  if (!token) {
    setCreateProgramMessage("Session expired. Please log in again.", "error");
    return;
  }

  setCreateProgramMessage("Loading schools...");

  try {
    const responseData = await fetchAllSchoolsForPrograms(token);
    schoolsCache = normalizeCollection(responseData);
    renderCreateProgramForm({ schools: schoolsCache, departments: [] });
    renderCreatedProgramDetails(null);
    bindCreateProgramSubmit(handleCreateProgramSubmit);
    bindProgramSchoolChange(handleProgramSchoolChange);
    setCreateProgramMessage(
      schoolsCache.length > 0
        ? "Select school and department, then fill program details."
        : "No schools available.",
      schoolsCache.length > 0 ? "" : "error"
    );
  } catch (error) {
    renderCreateProgramForm({ schools: [], departments: [] });
    renderCreatedProgramDetails(null);
    setCreateProgramMessage(error.message || "Failed to load schools.", "error");
    console.error("Load schools for programs failed:", error);
  }
}

/**
 * Responds to a change in the school selection during program creation.
 * Dynamically refreshes the available department options for the targeted school.
 * @param {string|number} schoolId - The ID of the selected school.
 * @returns {Promise<void>} Resolves once the department dropdown is updated.
 */
async function handleProgramSchoolChange(schoolId) {
  const token = loadToken();
  if (!token) {
    setCreateProgramMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!schoolId) {
    setProgramDepartmentOptions([]);
    return;
  }

  setCreateProgramMessage("Loading departments...");

  try {
    const departments = await ensureDepartmentsBySchool(schoolId, token);
    setProgramDepartmentOptions(departments);
    setCreateProgramMessage("");
  } catch (error) {
    setProgramDepartmentOptions([]);
    setCreateProgramMessage(error.message || "Failed to load departments.", "error");
  }
}

/**
 * Processes the final submission of a new academic program.
 * @param {object} payload - Program details including name, code, school, and department.
 * @returns {Promise<void>} Resolves after the program is saved and feedback is rendered.
 */
async function handleCreateProgramSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setCreateProgramMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.name || !payload.code || !payload.schoolId || !payload.departmentId) {
    setCreateProgramMessage("Program name, code, school, and department are required.", "error");
    return;
  }

  setCreateProgramSubmitting(true);
  setCreateProgramMessage("");

  try {
    const createdProgram = await createProgram(payload, token);
    setCreateProgramMessage("Program created successfully.", "success");
    renderCreatedProgramDetails(createdProgram);
  } catch (error) {
    setCreateProgramMessage(error.message || "Failed to create program.", "error");
    renderCreatedProgramDetails(null);
    console.error("Create program failed:", error);
  } finally {
    setCreateProgramSubmitting(false);
  }
}

/**
 * Loads and displays the comprehensive list of all academic programs.
 * Fetches minimal program records and builds full display records in parallel.
 * @returns {Promise<void>} Resolves once the complete program grid is rendered.
 */
async function handleViewAllProgramsRequested() {
  const token = loadToken();
  if (!token) {
    renderProgramsScreen([]);
    setProgramsMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderProgramsScreen([]);
  setProgramsMessage("Loading programs...");

  try {
    currentProgramListView = "all";
    const minimalProgramsResponse = await fetchAllProgramsMinimal(token);
    const minimalPrograms = normalizeCollection(minimalProgramsResponse);
    allPrograms = await buildProgramDisplayRecords(minimalPrograms, token);
    renderProgramsScreen(allPrograms);
    setProgramsMessage(`Loaded ${allPrograms.length} program(s).`, "success");
    bindProgramsEvents();
  } catch (error) {
    renderProgramsScreen([]);
    setProgramsMessage(error.message || "Failed to load programs.", "error");
    console.error("View all programs failed:", error);
  }
}

/**
 * Triggers the comprehensive 'Program Lookup' tab.
 * Prepares the multi-stage filter environment (School -> Department -> Program).
 * @returns {Promise<void>} Resolves once the lookup screen is initialized.
 */
async function handleProgramDetailsTabRequested() {
  const token = loadToken();
  if (!token) {
    renderProgramLookupScreen({ schools: [], departments: [], programs: [] });
    setProgramLookupMessage("Session expired. Please log in again.", "error");
    return;
  }

  renderProgramLookupScreen({ schools: [], departments: [], programs: [] });
  setProgramLookupMessage("Loading schools...");

  try {
    currentProgramListView = "lookup";
    programLookupSchools = await ensureAllSchools(token);
    selectedLookupSchoolId = "";
    selectedLookupDepartmentId = "";
    programLookupDepartments = [];
    programLookupPrograms = [];

    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: programLookupDepartments,
      programs: programLookupPrograms,
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage("Select school, department, and program to narrow results.");
  } catch (error) {
    renderProgramLookupScreen({ schools: [], departments: [], programs: [] });
    setProgramLookupMessage(error.message || "Failed to load schools.", "error");
  }
}

/**
 * Binds bind program lookup events.
 * @returns {void}
 */
function bindProgramLookupEvents() {
  bindProgramLookupFilters({
    onSchoolChange: handleProgramLookupSchoolChange,
    onDepartmentChange: handleProgramLookupDepartmentChange,
    onProgramChange: handleProgramLookupProgramChange
  });
  bindProgramSelect(handleProgramSelected);
}

/**
 * Managed the cascading school filter within the Program Lookup experience.
 * Automatically fetches and updates both department and program child-collections.
 * @param {string|number} schoolId - The selected school identifier.
 * @returns {Promise<void>} Resolves when the lookup view is refreshed.
 */
async function handleProgramLookupSchoolChange(schoolId) {
  const token = loadToken();
  if (!token) {
    setProgramLookupMessage("Session expired. Please log in again.", "error");
    return;
  }

  selectedLookupSchoolId = schoolId;
  selectedLookupDepartmentId = "";
  programLookupPrograms = [];
  allPrograms = [];

  if (!schoolId) {
    programLookupDepartments = [];
    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: programLookupDepartments,
      programs: programLookupPrograms,
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage("Choose a school to view programs.");
    return;
  }

  setProgramLookupMessage("Loading departments and programs...");
  try {
    const [departmentsResponse, programsResponse] = await Promise.all([
      fetchDepartmentsBySchoolForPrograms(schoolId, token),
      fetchProgramsBySchool(schoolId, token)
    ]);

    programLookupDepartments = normalizeCollection(departmentsResponse);
    const rawPrograms = normalizeCollection(programsResponse);
    programLookupPrograms = normalizeProgramRecords(rawPrograms);
    allPrograms = programLookupPrograms;

    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: programLookupDepartments,
      programs: programLookupPrograms,
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage(`Loaded ${programLookupPrograms.length} program(s).`, "success");
  } catch (error) {
    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: [],
      programs: [],
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage(error.message || "Failed to load school programs.", "error");
  }
}

/**
 * Handles handle program lookup department change.
 * @param {string|number} departmentId
 * @returns {Promise<*>}
 */
async function handleProgramLookupDepartmentChange(departmentId) {
  const token = loadToken();
  if (!token) {
    setProgramLookupMessage("Session expired. Please log in again.", "error");
    return;
  }

  selectedLookupDepartmentId = departmentId;
  if (!selectedLookupSchoolId) {
    setProgramLookupMessage("Select a school first.", "error");
    return;
  }

  if (!departmentId) {
    await handleProgramLookupSchoolChange(selectedLookupSchoolId);
    return;
  }

  setProgramLookupMessage("Loading department programs...");
  try {
    const programsResponse = await fetchProgramsByDepartment(departmentId, token);
    const rawPrograms = normalizeCollection(programsResponse);
    const departmentPrograms = normalizeProgramRecords(rawPrograms).filter(
      (program) => String(program.schoolId || "") === String(selectedLookupSchoolId)
    );
    programLookupPrograms = departmentPrograms;
    allPrograms = departmentPrograms;

    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: programLookupDepartments,
      programs: programLookupPrograms,
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage(`Loaded ${programLookupPrograms.length} program(s).`, "success");
  } catch (error) {
    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: programLookupDepartments,
      programs: [],
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage(error.message || "Failed to load department programs.", "error");
  }
}

/**
 * Handles handle program lookup program change.
 * @param {string|number} programId
 * @returns {void}
 */
function handleProgramLookupProgramChange(programId) {
  if (!programId) {
    allPrograms = [...programLookupPrograms];
    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: programLookupDepartments,
      programs: allPrograms,
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage(`Loaded ${allPrograms.length} program(s).`, allPrograms.length ? "success" : "");
    return;
  }

  const selectedProgram = programLookupPrograms.find(
    (program) => String(program.id) === String(programId)
  );
  allPrograms = selectedProgram ? [selectedProgram] : [];

  renderProgramLookupScreen({
    schools: programLookupSchools,
    departments: programLookupDepartments,
    programs: allPrograms,
    selectedSchoolId: selectedLookupSchoolId,
    selectedDepartmentId: selectedLookupDepartmentId
  });
  bindProgramLookupEvents();
  setProgramLookupMessage(
    selectedProgram ? "Program selected." : "Selected program not found.",
    selectedProgram ? "success" : "error"
  );
}

/**
 * Binds bind programs events.
 * @returns {void}
 */
function bindProgramsEvents() {
  bindProgramSelect(handleProgramSelected);
}

/**
 * Handles the selection of a program from the list, directing the user to the action modal.
 * @param {string|number} programId - Unique identifier for the selected program.
 * @returns {void} Launches the program action screen.
 */
function handleProgramSelected(programId) {
  const selectedProgram = getProgramById(programId);
  if (!selectedProgram) {
    setProgramsMessage("Selected program was not found in loaded results.", "error");
    return;
  }

  openProgramActionScreen(selectedProgram);
}

/**
 * Opens the core action modal for a specific program.
 * Binds triggers for viewing full details, updating, deleting, or managing courses.
 * @param {object} program - The active program object.
 * @returns {void} Renders the action interface.
 */
function openProgramActionScreen(program) {
  renderProgramDetailsScreen(program);
  bindProgramDetailsActions({
    onViewDetails: handleProgramViewDetails,
    onUpdateDetails: handleProgramUpdateDetails,
    onDeleteProgram: handleProgramDelete,
    onAddCourse: handleProgramAddCourse,
    onAllCourses: handleProgramAllCourses,
    onClose: handleProgramDetailsClose
  });
}

/**
 * Retrieves and displays the comprehensive program profile, including curriculum detail.
 * Coordinates parallel fetching of core program stats and associated course assignments.
 * @param {string|number} programId - The target program to examine.
 * @returns {Promise<void>} Resolves when the full details screen is populated.
 */
async function handleProgramViewDetails(programId) {
  const token = loadToken();
  if (!token) {
    setProgramDetailsMessage("Session expired. Please log in again.", "error");
    return;
  }

  setProgramDetailsMessage("Loading full program details...");

  try {
    const [programDetailsResponse, programCoursesResponse] = await Promise.all([
      fetchProgramById(programId, token),
      fetchProgramCourses(programId, token)
    ]);

    const mergedProgram = mergeProgram(programId, programDetailsResponse || {});
    selectedProgramCourses = normalizeCollection(programCoursesResponse);
    selectedProgramYear = getInitialProgramYear(selectedProgramCourses);
    renderProgramFullDetailsWithBindings(mergedProgram);
    setProgramFullDetailsMessage("Program details loaded.", "success");
  } catch (error) {
    setProgramDetailsMessage(error.message || "Failed to load program details.", "error");
  }
}

/**
 * Renders the full details view and binds specific sub-actions like study-year filtering.
 * @param {object} program - The fully populated program record.
 * @returns {void} Updates the UI with detailed curriculum and metadata.
 */
function renderProgramFullDetailsWithBindings(program) {
  renderProgramFullDetailsScreen(program, selectedProgramCourses, selectedProgramYear);
  bindProgramFullDetailsActions({
    onYearChange: (year) => {
      selectedProgramYear = year;
      renderProgramFullDetailsWithBindings(program);
    },
    onClose: () => openProgramActionScreen(program)
  });
}

/**
 * Initiates the 'Update Program' workflow by rendering the edit form.
 * @param {string|number} programId - The identifier of the program to modify.
 * @returns {void} Displays the update form with current program values.
 */
function handleProgramUpdateDetails(programId) {
  const program = getProgramById(programId);
  if (!program) {
    setProgramDetailsMessage("Program not found.", "error");
    return;
  }

  renderProgramUpdateForm(program);
  bindProgramUpdateForm(
    (payload) => handleProgramUpdateSubmit(payload),
    () => openProgramActionScreen(program)
  );
}

/**
 * Transmits program metadata updates to the server.
 * @param {object} payload - Updated name, code, and parent identifiers.
 * @returns {Promise<void>} Resolves when the program is updated and navigated back to details.
 */
async function handleProgramUpdateSubmit(payload) {
  const token = loadToken();
  if (!token) {
    setUpdateProgramMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.programId || !payload.name || !payload.code) {
    setUpdateProgramMessage("Program name and code are required.", "error");
    return;
  }

  setUpdateProgramSubmitting(true);
  setUpdateProgramMessage("Updating program...");

  try {
    const updatedProgram = await updateProgram(
      payload.programId,
      { name: payload.name, code: payload.code },
      token
    );
    const mergedProgram = mergeProgram(payload.programId, updatedProgram || payload);
    setUpdateProgramMessage("Program updated successfully.", "success");
    openProgramActionScreen(mergedProgram);
    setProgramDetailsMessage("Program updated successfully.", "success");
  } catch (error) {
    setUpdateProgramMessage(error.message || "Failed to update program.", "error");
  } finally {
    setUpdateProgramSubmitting(false);
  }
}

/**
 * Orchestrates the permanent removal of an academic program.
 * Includes a terminal confirmation prompt to prevent accidental data loss.
 * @param {string|number} programId - The program to be deleted.
 * @returns {Promise<void>} Resolves after the program is purged and the list refreshed.
 */
async function handleProgramDelete(programId) {
  const token = loadToken();
  if (!token) {
    setProgramDetailsMessage("Session expired. Please log in again.", "error");
    return;
  }

  const program = getProgramById(programId);
  if (!program) {
    setProgramDetailsMessage("Program not found.", "error");
    return;
  }

  const confirmed = window.confirm(
    `Delete program \"${program.name || program.code || program.id}\"?`
  );
  if (!confirmed) {
    return;
  }

  try {
    await deleteProgram(programId, token);
    allPrograms = allPrograms.filter((item) => String(item.id) !== String(programId));
    renderProgramsScreen(allPrograms);
    setProgramsMessage("Program deleted successfully.", "success");
    bindProgramsEvents();
  } catch (error) {
    setProgramDetailsMessage(error.message || "Failed to delete program.", "error");
  }
}

/**
 * Launches the interface for adding a new course to a program's curriculum.
 * Pre-fetches school context to ensure the correct course options are available.
 * @param {string|number} programId - The program that will receive the new course.
 * @returns {Promise<void>} Resolves when the curriculum addition form is ready.
 */
async function handleProgramAddCourse(programId) {
  const token = loadToken();
  if (!token) {
    setProgramDetailsMessage("Session expired. Please log in again.", "error");
    return;
  }

  const program = getProgramById(programId);
  if (!program) {
    setProgramDetailsMessage("Program not found.", "error");
    return;
  }

  try {
    const schools = await ensureAllSchools(token);
    const defaultSchoolId = String(program.schoolId || schools[0]?.id || schools[0]?.schoolId || "");
    const courses = defaultSchoolId ? await ensureCoursesBySchool(defaultSchoolId, token) : [];

    renderAddCourseToProgramForm({
      program,
      schools,
      courses,
      selectedSchoolId: defaultSchoolId
    });

    bindProgramCourseSchoolChange(async (schoolId) => {
      setAddCourseToProgramMessage("Loading courses...");
      try {
        const nextCourses = schoolId ? await ensureCoursesBySchool(schoolId, token) : [];
        setProgramCourseOptions(nextCourses);
        setAddCourseToProgramMessage("");
      } catch (error) {
        setProgramCourseOptions([]);
        setAddCourseToProgramMessage(error.message || "Failed to load courses.", "error");
      }
    });

    bindAddCourseToProgramForm(
      (payload) => handleAddCourseToProgramSubmit(payload, program),
      () => openProgramActionScreen(program)
    );
  } catch (error) {
    setProgramDetailsMessage(error.message || "Failed to open add-course screen.", "error");
  }
}

/**
 * Processes the final curriculum mapping between a course and a program.
 * @param {object} payload - Mapping data (courseId, type, study year).
 * @param {object} program - The parent program context.
 * @returns {Promise<void>} Resolves after the association is persisted.
 */
async function handleAddCourseToProgramSubmit(payload, program) {
  const token = loadToken();
  if (!token) {
    setAddCourseToProgramMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.programId || !payload.courseId || !payload.courseType || !payload.yearOfStudy) {
    setAddCourseToProgramMessage("Course, type, and year of study are required.", "error");
    return;
  }

  setAddCourseToProgramSubmitting(true);
  setAddCourseToProgramMessage("Adding course to program...");

  try {
    await addCourseToProgram(
      payload.programId,
      payload.courseId,
      {
        courseType: payload.courseType,
        yearOfStudy: Number(payload.yearOfStudy)
      },
      token
    );
    setAddCourseToProgramMessage("Course added successfully.", "success");
    openProgramActionScreen(program);
    setProgramDetailsMessage("Course added successfully.", "success");
  } catch (error) {
    setAddCourseToProgramMessage(error.message || "Failed to add course.", "error");
  } finally {
    setAddCourseToProgramSubmitting(false);
  }
}

/**
 * Loads and displays the complete curriculum list for a specific program.
 * @param {string|number} programId - The program whose courses are being audited.
 * @returns {Promise<void>} Resolves when the course list is rendered.
 */
async function handleProgramAllCourses(programId) {
  const token = loadToken();
  if (!token) {
    setProgramDetailsMessage("Session expired. Please log in again.", "error");
    return;
  }

  const program = getProgramById(programId);
  if (!program) {
    setProgramDetailsMessage("Program not found.", "error");
    return;
  }

  try {
    const coursesResponse = await fetchProgramCourses(programId, token);
    selectedProgramCourses = normalizeCollection(coursesResponse);
    renderProgramCoursesWithBindings(
      program,
      `Loaded ${selectedProgramCourses.length} course(s).`,
      "success"
    );
  } catch (error) {
    setProgramDetailsMessage(error.message || "Failed to load program courses.", "error");
  }
}

/**
 * Removes a course from a program's curriculum with user confirmation.
 * @param {object} ids - The identifiers for the relationship (programId, courseId).
 * @param {object} program - The parent program context for UI refreshing.
 * @returns {Promise<void>} Resolves once the curriculum is updated.
 */
async function handleRemoveCourseFromProgram({ programId, courseId }, program) {
  const token = loadToken();
  if (!token) {
    setSelectedProgramCourseMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!programId || !courseId) {
    setSelectedProgramCourseMessage("Invalid course selection.", "error");
    return;
  }

  const confirmed = window.confirm("Remove this course from the program?");
  if (!confirmed) {
    return;
  }

  try {
    await removeCourseFromProgram(programId, courseId, token);
    selectedProgramCourses = selectedProgramCourses.filter(
      (course) => String(course.courseId || course.id) !== String(courseId)
    );
    renderProgramCoursesWithBindings(program, "Course removed successfully.", "success");
  } catch (error) {
    setSelectedProgramCourseMessage(error.message || "Failed to remove course.", "error");
  }
}

/**
 * Renders render program courses with bindings.
 * @param {object} program
 * @param {string} message
 * @param {string} messageType
 * @returns {void}
 */
function renderProgramCoursesWithBindings(program, message = "", messageType = "") {
  renderProgramCoursesScreen(program, selectedProgramCourses);
  if (message) {
    setProgramCoursesMessage(message, messageType);
  }

  bindProgramCourseSelect((courseId) => {
    const selectedCourse = selectedProgramCourses.find(
      (course) => String(course.courseId || course.id) === String(courseId)
    );
    if (!selectedCourse) {
      setProgramCoursesMessage("Selected course not found.", "error");
      return;
    }

    renderSelectedProgramCourseActions(selectedCourse);
    bindSelectedProgramCourseActions({
      onRemove: (ids) => handleRemoveCourseFromProgram(ids, program),
      onEdit: (ids) => handleProgramCourseEdit(ids, selectedCourse, program),
      onClose: () => hideSelectedProgramCourseActions()
    });
  });

  bindProgramCoursesClose(() => openProgramActionScreen(program));
}

/**
 * Handles handle program course edit.
 * @param {object} params
 * @param {*} params.programId
 * @param {*} params.courseId
 * @param {object} selectedCourse
 * @param {object} program
 * @returns {void}
 */
function handleProgramCourseEdit({ programId, courseId }, selectedCourse, program) {
  if (!programId || !courseId) {
    setSelectedProgramCourseMessage("Invalid course selection.", "error");
    return;
  }

  openProgramCourseEditModal(selectedCourse);
  bindProgramCourseEditModal({
    onSubmit: (payload) =>
      handleProgramCourseEditSubmit({
        programId,
        courseId,
        payload,
        selectedCourse,
        program
      }),
    onClose: () => { }
  });
}

/**
 * Handles handle program course edit submit.
 * @param {object} params
 * @param {*} params.programId
 * @param {*} params.courseId
 * @param {*} params.payload
 * @param {*} params.selectedCourse
 * @param {*} params.program
 * @returns {Promise<*>}
 */
async function handleProgramCourseEditSubmit({ programId, courseId, payload, selectedCourse, program }) {
  const token = loadToken();
  if (!token) {
    setProgramCourseEditModalMessage("Session expired. Please log in again.", "error");
    return;
  }

  if (!payload.courseType || !payload.yearOfStudy) {
    setProgramCourseEditModalMessage("Course type and year of study are required.", "error");
    return;
  }

  setProgramCourseEditModalSubmitting(true);
  setProgramCourseEditModalMessage("Saving changes...");

  try {
    const updatedAssociation = await updateProgramCourseAssociation(
      programId,
      courseId,
      {
        courseType: payload.courseType,
        yearOfStudy: Number(payload.yearOfStudy)
      },
      token
    );

    selectedProgramCourses = selectedProgramCourses.map((course) => {
      if (String(course.courseId || course.id) !== String(courseId)) {
        return course;
      }

      return {
        ...course,
        ...selectedCourse,
        ...(updatedAssociation || {}),
        courseId
      };
    });

    closeProgramCourseEditModal();
    hideSelectedProgramCourseActions();
    renderProgramCoursesWithBindings(program, "Course details updated successfully.", "success");
  } catch (error) {
    setProgramCourseEditModalMessage(
      error.message || "Failed to update course details in this program.",
      "error"
    );
  } finally {
    setProgramCourseEditModalSubmitting(false);
  }
}

/**
 * Handles handle program details close.
 * @returns {void}
 */
function handleProgramDetailsClose() {
  if (currentProgramListView === "external" && externalProgramCloseHandler) {
    const onClose = externalProgramCloseHandler;
    externalProgramCloseHandler = null;
    onClose();
    return;
  }

  if (currentProgramListView === "lookup") {
    renderProgramLookupScreen({
      schools: programLookupSchools,
      departments: programLookupDepartments,
      programs: allPrograms,
      selectedSchoolId: selectedLookupSchoolId,
      selectedDepartmentId: selectedLookupDepartmentId
    });
    bindProgramLookupEvents();
    setProgramLookupMessage(`Loaded ${allPrograms.length} program(s).`, allPrograms.length ? "success" : "");
    return;
  }

  renderProgramsScreen(allPrograms);
  setProgramsMessage(`Loaded ${allPrograms.length} program(s).`, "success");
  bindProgramsEvents();
}

/**
 * Gets get program by id.
 * @param {string|number} programId
 * @returns {*}
 */
function getProgramById(programId) {
  return allPrograms.find((program) => String(program.id) === String(programId));
}

/**
 * Merges merge program.
 * @param {string|number} programId
 * @param {Array<*>} nextValues
 * @returns {*}
 */
function mergeProgram(programId, nextValues) {
  let mergedProgram = null;

  allPrograms = allPrograms.map((program) => {
    if (String(program.id) !== String(programId)) {
      return program;
    }

    mergedProgram = {
      ...program,
      ...(nextValues || {})
    };
    return mergedProgram;
  });

  return mergedProgram || getProgramById(programId) || nextValues;
}

/**
 * Ensures ensure departments by school.
 * @param {string|number} schoolId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureDepartmentsBySchool(schoolId, token) {
  if (departmentsCacheBySchoolId.has(schoolId)) {
    return departmentsCacheBySchoolId.get(schoolId);
  }

  const responseData = await fetchDepartmentsBySchoolForPrograms(schoolId, token);
  const departments = normalizeCollection(responseData);
  departmentsCacheBySchoolId.set(schoolId, departments);
  return departments;
}

/**
 * Ensures ensure courses by school.
 * @param {string|number} schoolId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureCoursesBySchool(schoolId, token) {
  if (coursesCacheBySchoolId.has(schoolId)) {
    return coursesCacheBySchoolId.get(schoolId);
  }

  const responseData = await fetchCoursesBySchool(schoolId, token);
  const courses = normalizeCollection(responseData);
  coursesCacheBySchoolId.set(schoolId, courses);
  return courses;
}

/**
 * Builds build program display records.
 * @param {Array<*>} minimalPrograms
 * @param {string} token
 * @returns {Promise<*>}
 */
async function buildProgramDisplayRecords(minimalPrograms, token) {
  const schools = await ensureAllSchools(token);
  const schoolById = new Map(
    schools.map((school) => [String(school.id || school.schoolId), school])
  );

  const schoolIds = [...new Set(minimalPrograms.map((program) => String(program.schoolId || "")))].filter(
    (schoolId) => schoolId
  );

  const departmentsById = new Map();
  await Promise.all(
    schoolIds.map(async (schoolId) => {
      const departments = await ensureDepartmentsBySchool(schoolId, token);
      departments.forEach((department) => {
        const id = String(department.id || department.departmentId || "");
        if (id) {
          departmentsById.set(id, department);
        }
      });
    })
  );

  const programDetailsById = await fetchProgramDetailsMap(minimalPrograms, token);

  return minimalPrograms.map((program, index) => {
    const schoolId = String(program.schoolId || "");
    const departmentId = String(program.departmentId || "");
    const school = schoolById.get(schoolId) || {};
    const department = departmentsById.get(departmentId) || {};
    const programDetails = programDetailsById.get(String(program.id || "")) || {};

    return {
      ...program,
      ...programDetails,
      id: program.id,
      name:
        program.name ||
        programDetails.name ||
        (program.id ? `Program ${String(program.id).slice(0, 8)}` : `Program ${index + 1}`),
      code: program.code || programDetails.code || "",
      schoolId,
      schoolName:
        program.schoolName || programDetails.schoolName || school.name || school.schoolName || "",
      schoolCode: program.schoolCode || programDetails.schoolCode || school.code || school.schoolCode || "",
      departmentId,
      departmentName:
        program.departmentName ||
        programDetails.departmentName ||
        department.name ||
        department.departmentName ||
        "",
      departmentCode:
        program.departmentCode ||
        programDetails.departmentCode ||
        department.code ||
        department.departmentCode ||
        ""
    };
  });
}

/**
 * Ensures ensure all schools.
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureAllSchools(token) {
  if (schoolsCache.length > 0) {
    return schoolsCache;
  }

  const responseData = await fetchAllSchoolsForPrograms(token);
  schoolsCache = normalizeCollection(responseData);
  return schoolsCache;
}

/**
 * Fetches fetch program details map.
 * @param {Array<*>} programs
 * @param {string} token
 * @returns {Promise<*>}
 */
async function fetchProgramDetailsMap(programs, token) {
  const detailsEntries = await Promise.all(
    programs.map(async (program) => {
      const programId = String(program.id || "");
      if (!programId) {
        return [programId, null];
      }

      try {
        const details = await fetchProgramById(programId, token);
        return [programId, details];
      } catch {
        return [programId, null];
      }
    })
  );

  return new Map(detailsEntries);
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
    "schools",
    "departments",
    "programs",
    "courses",
    "content",
    "items",
    "results"
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

  if (responseData.id || responseData.name || responseData.code || responseData.schoolId) {
    return [responseData];
  }

  return [];
}

/**
 * Normalizes normalize program records.
 * @param {Array<*>} programs
 * @returns {*}
 */
function normalizeProgramRecords(programs) {
  if (!Array.isArray(programs)) {
    return [];
  }

  return programs.map((program, index) => ({
    ...program,
    id: program.id,
    name:
      program.name ||
      (program.id ? `Program ${String(program.id).slice(0, 8)}` : `Program ${index + 1}`),
    code: program.code || "",
    schoolId: String(program.schoolId || ""),
    schoolName: program.schoolName || "",
    schoolCode: program.schoolCode || "",
    departmentId: String(program.departmentId || ""),
    departmentName: program.departmentName || "",
    departmentCode: program.departmentCode || ""
  }));
}

/**
 * Ensures ensure program action record.
 * @param {object} program
 * @param {string} token
 * @returns {Promise<*>}
 */
async function ensureProgramActionRecord(program, token) {
  const baseProgram = program && typeof program === "object" ? program : {};
  const programId = String(baseProgram.id || baseProgram.programId || "");
  if (!programId) {
    return null;
  }

  let programDetails = {};
  try {
    const response = await fetchProgramById(programId, token);
    if (response && typeof response === "object") {
      programDetails = response;
    }
  } catch {
    // Fallback to base program if details fetch fails.
  }

  const merged = {
    ...baseProgram,
    ...programDetails,
    id: programId,
    schoolId: String(baseProgram.schoolId || programDetails.schoolId || ""),
    departmentId: String(baseProgram.departmentId || programDetails.departmentId || "")
  };

  if (!merged.schoolName || !merged.schoolCode) {
    const schools = await ensureAllSchools(token);
    const school = schools.find(
      (item) => String(item.id || item.schoolId || "") === String(merged.schoolId || "")
    );
    if (school) {
      merged.schoolName = merged.schoolName || school.name || school.schoolName || "";
      merged.schoolCode = merged.schoolCode || school.code || school.schoolCode || "";
    }
  }

  if ((!merged.departmentName || !merged.departmentCode) && merged.schoolId) {
    try {
      const departments = await ensureDepartmentsBySchool(merged.schoolId, token);
      const department = departments.find(
        (item) => String(item.id || item.departmentId || "") === String(merged.departmentId || "")
      );
      if (department) {
        merged.departmentName =
          merged.departmentName || department.name || department.departmentName || "";
        merged.departmentCode =
          merged.departmentCode || department.code || department.departmentCode || "";
      }
    } catch {
      // Keep existing department fields if lookup fails.
    }
  }

  merged.name = merged.name || merged.programName || `Program ${programId.slice(0, 8)}`;
  merged.code = merged.code || merged.programCode || "";
  return merged;
}

/**
 * Gets get initial program year.
 * @param {Array<*>} courses
 * @returns {*}
 */
function getInitialProgramYear(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return 1;
  }

  const years = courses
    .map((course) => Number(course.yearOfStudy || 0))
    .filter((year) => Number.isFinite(year) && year >= 1)
    .sort((left, right) => left - right);

  return years[0] || 1;
}
