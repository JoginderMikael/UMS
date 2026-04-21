/**
 * @fileoverview Administrative controller for managing University Courses.
 * Coordinates course creation, updates, deletion, and linking courses to programs.
 * Provides advanced lookup and filtering mechanisms for course offerings.
 * @module admin/controllers/courseController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import {
  createCourse,
  deleteCourse,
  fetchAllUniversityCourses,
  fetchCourseById,
  fetchCoursesByDepartment,
  fetchCoursesByProgram,
  fetchCoursesBySchool,
  updateCourse
} from "../models/courseModel.js";
import {
  addCourseToProgram,
  fetchAllSchoolsForPrograms,
  fetchDepartmentsBySchoolForPrograms,
  fetchProgramCourses,
  fetchProgramsBySchool
} from "../models/programModel.js";
import {
  bindAllCoursesSearch,
  bindCourseDetailsActions,
  bindCourseDetailsTrigger,
  bindCourseLookupFilters,
  bindCourseProgramDepartmentChange,
  bindCourseProgramForm,
  bindCourseProgramSchoolChange,
  bindCourseSchoolChange,
  bindCourseSelect,
  bindCourseUpdateForm,
  bindCreateCourseSubmit,
  bindCreateCourseTriggers,
  bindCreatedCourseActions,
  bindViewAllCoursesTrigger,
  renderAllCoursesScreen,
  renderCourseDetailsLookupScreen,
  renderCourseDetailsScreen,
  renderCourseProgramForm,
  renderCourseUpdateForm,
  renderCreateCourseForm,
  renderCreatedCourseDetails,
  setAllCoursesMessage,
  setCourseDepartmentOptions,
  setCourseDetailsMessage,
  setCourseLookupMessage,
  setCourseProgramDepartmentOptions,
  setCourseProgramMessage,
  setCourseProgramOptions,
  setCourseProgramSubmitting,
  setCreateCourseMessage,
  setCreateCourseSubmitting,
  setUpdateCourseMessage,
  setUpdateCourseSubmitting
} from "../views/courseView.js";

let schools = [];
const departmentsBySchool = new Map();
const programsBySchool = new Map();
let createdCourse = null;
let selectedCourse = null;
let selectedContext = "details";
let programFormSchoolId = "";

let lookup = { schoolId: "", departmentId: "", programId: "", year: 0, departments: [], programs: [], courses: [] };
let allCourses = [];
let allCoursesQuery = "";

/**
 * Initializes the course controller by binding primary management triggers.
 * Sets up listeners for course creation, detailed lookups, and the university-wide course catalogue.
 * @returns {void} No return value.
 */
export function initCourseController() {
  bindCreateCourseTriggers(openCreateCourse);
  bindCourseDetailsTrigger(openCourseDetailsLookup);
  bindViewAllCoursesTrigger(openAllCourses);
}

/**
 * Transitions the UI to the course creation workflow.
 * Pre-fetches school data to populate the creation form.
 * @returns {Promise<void>} Resolves when the creation form is rendered.
 */
async function openCreateCourse() {
  const bindCreateScreenActions = () => {
    renderCreatedCourseDetails(createdCourse);
    bindCreateCourseSubmit(submitCreateCourse);
    bindCourseSchoolChange(handleCreateSchoolChange);
    bindCreatedCourseActions({
      onAddToProgram: (courseId) => openCourseProgram(courseId, "create"),
      onOpenDetails: (courseId) => openCourseDetails(courseId, "create")
    });
  };

  renderCreateCourseForm({ schools, departments: [] });
  bindCreateScreenActions();

  const token = loadToken();
  if (!token) {
    return setCreateCourseMessage("Session expired. Please log in again.", "error");
  }

  try {
    if (schools.length === 0) {
      schools = normalizeCollection(await fetchAllSchoolsForPrograms(token));
    }

    const selectedSchoolId = String(schools[0]?.id || schools[0]?.schoolId || "");
    const departments = selectedSchoolId ? await getDepartments(selectedSchoolId, token) : [];

    renderCreateCourseForm({
      schools,
      departments,
      selectedSchoolId
    });
    bindCreateScreenActions();
    setCreateCourseMessage(schools.length ? "Fill in course details." : "No schools available.", schools.length ? "" : "error");
  } catch (error) {
    renderCreateCourseForm({ schools: [], departments: [] });
    bindCreateScreenActions();
    setCreateCourseMessage(error.message || "Failed to load schools/departments.", "error");
  }
}

/**
 * Responds to school selection changes in the course creation form.
 * Refreshes the department options appropriate for the chosen school.
 * @param {string|number} schoolId - The unique ID of the selected school.
 * @returns {Promise<void>} Resolves when department options are updated.
 */
async function handleCreateSchoolChange(schoolId) {
  const token = loadToken();
  if (!token) return setCreateCourseMessage("Session expired. Please log in again.", "error");
  if (!schoolId) return setCourseDepartmentOptions([]);
  try {
    const departments = await getDepartments(schoolId, token);
    setCourseDepartmentOptions(departments);
  } catch (error) {
    setCourseDepartmentOptions([]);
    setCreateCourseMessage(error.message || "Failed to load departments.", "error");
  }
}

/**
 * Processes the submission of the new course form.
 * Validates requirements and credit units before sending the request to the backend.
 * @param {object} payload - The course definition (title, code, units, department).
 * @returns {Promise<void>} Resolves after successful creation and response handling.
 */
async function submitCreateCourse(payload) {
  const token = loadToken();
  if (!token) return setCreateCourseMessage("Session expired. Please log in again.", "error");
  if (!payload.title || !payload.code || !payload.schoolId || !payload.departmentId) {
    return setCreateCourseMessage("Course title, code, school, and department are required.", "error");
  }
  if (!Number.isInteger(payload.creditUnits) || payload.creditUnits < 0) {
    return setCreateCourseMessage("Credit units must be a whole number that is zero or greater.", "error");
  }

  setCreateCourseSubmitting(true);
  try {
    const response = await createCourse(payload, token);
    createdCourse = normalizeCourse({ ...payload, ...(response || {}) });
    upsertCourse(createdCourse);
    renderCreatedCourseDetails(createdCourse);
    bindCreatedCourseActions({
      onAddToProgram: (courseId) => openCourseProgram(courseId, "create"),
      onOpenDetails: (courseId) => openCourseDetails(courseId, "create")
    });
    setCreateCourseMessage("Course created successfully.", "success");
  } catch (error) {
    setCreateCourseMessage(error.message || "Failed to create course.", "error");
  } finally {
    setCreateCourseSubmitting(false);
  }
}

/**
 * Launches the course lookup interface.
 * Initializes the contextual filter state and prepares the screen for exploration.
 * @returns {Promise<void>} Resolves when the search interface is ready.
 */
async function openCourseDetailsLookup() {
  const token = loadToken();
  if (!token) return;
  if (schools.length === 0) schools = normalizeCollection(await fetchAllSchoolsForPrograms(token));
  lookup = { schoolId: "", departmentId: "", programId: "", year: 0, departments: [], programs: [], courses: [] };
  renderLookup("Select school, department, course or program filters.");
}

/**
 * Directs the rendering of the course lookup screen with active filters and results.
 * Manages the binding of dynamic filter triggers (school -> department -> program).
 * @param {string} [message=""] - Contextual instructional or status message.
 * @param {string} [type=""] - The alert type ('success', 'error', etc.).
 * @returns {void} No return value.
 */
function renderLookup(message = "", type = "") {
  renderCourseDetailsLookupScreen({
    schools,
    departments: lookup.departments,
    programs: lookup.programs,
    courses: lookup.courses,
    selectedSchoolId: lookup.schoolId,
    selectedDepartmentId: lookup.departmentId,
    selectedProgramId: lookup.programId,
    selectedYear: lookup.year
  });
  bindCourseLookupFilters({
    onSchoolChange: onLookupSchoolChange,
    onDepartmentChange: onLookupDepartmentChange,
    onProgramChange: onLookupProgramChange,
    onYearChange: onLookupYearChange,
    onCourseChange: (courseId) => courseId && openCourseDetails(courseId, "details")
  });
  bindCourseSelect((courseId) => openCourseDetails(courseId, "details"));
  if (message) setCourseLookupMessage(message, type);
}

/**
 * Updates the lookup context when the school filter is changed.
 * Triggers a cascade of data fetching for child departments, programs, and courses.
 * @param {string|number} schoolId - The selected school identifier.
 * @returns {Promise<void>} Resolves when the dependent filters are refreshed.
 */
async function onLookupSchoolChange(schoolId) {
  const token = loadToken();
  if (!token) return;
  lookup.schoolId = schoolId;
  lookup.departmentId = "";
  lookup.programId = "";
  lookup.year = 0;
  if (!schoolId) {
    lookup.departments = [];
    lookup.programs = [];
    lookup.courses = [];
    return renderLookup("Select a school to load courses.");
  }
  lookup.departments = await getDepartments(schoolId, token);
  lookup.programs = await getPrograms(schoolId, token);
  lookup.courses = normalizeCourses(await fetchCoursesBySchool(schoolId, token));
  renderLookup(`Loaded ${lookup.courses.length} course(s).`, lookup.courses.length ? "success" : "error");
}

/**
 * Filters the current course results based on a specific department selection.
 * @param {string|number} departmentId - The ID of the department to filter by.
 * @returns {Promise<void>} Resolves once the filtered course list is displayed.
 */
async function onLookupDepartmentChange(departmentId) {
  const token = loadToken();
  if (!token) return;
  lookup.departmentId = departmentId;
  lookup.programId = "";
  lookup.year = 0;
  if (!lookup.schoolId) return setCourseLookupMessage("Select a school first.", "error");
  lookup.courses = departmentId
    ? normalizeCourses(await fetchCoursesByDepartment(departmentId, token))
    : normalizeCourses(await fetchCoursesBySchool(lookup.schoolId, token));
  renderLookup(`Loaded ${lookup.courses.length} course(s).`, lookup.courses.length ? "success" : "error");
}

/**
 * Refines the course list to show specific program offerings within the selected school.
 * Integrates offering data like course type and year of study.
 * @param {string|number} programId - The ID of the target program.
 * @returns {Promise<void>} Resolves when the program-specific results are rendered.
 */
async function onLookupProgramChange(programId) {
  const token = loadToken();
  if (!token) return;
  lookup.programId = programId;
  if (!programId) return onLookupDepartmentChange(lookup.departmentId);
  const merged = await getProgramCoursesWithOfferings(programId, token);
  lookup.courses = filterProgramCourses(merged, lookup.departmentId, lookup.year);
  renderLookup(`Loaded ${lookup.courses.length} course(s).`, lookup.courses.length ? "success" : "error");
}

/**
 * Filters program-associated courses by their recommended year of study.
 * @param {number|string} year - The academic year level (1, 2, 3, etc.).
 * @returns {Promise<void>} Resolves after the year-level filter is applied.
 */
async function onLookupYearChange(year) {
  lookup.year = Number(year || 0);
  if (!lookup.programId) return renderLookup("Year filter applies when program is selected.");
  const token = loadToken();
  if (!token) return;
  const merged = await getProgramCoursesWithOfferings(lookup.programId, token);
  lookup.courses = filterProgramCourses(merged, lookup.departmentId, lookup.year);
  renderLookup(`Loaded ${lookup.courses.length} course(s).`, lookup.courses.length ? "success" : "error");
}

/**
 * Fetches and displays a full, searchable list of every course in the university system.
 * @returns {Promise<void>} Resolves when the catalogue screen is displayed.
 */
async function openAllCourses() {
  const token = loadToken();
  if (!token) return;
  allCourses = normalizeCourses(await fetchAllUniversityCourses(token));
  allCoursesQuery = "";
  renderAllCoursesList(`Loaded ${allCourses.length} course(s).`, "success");
}

/**
 * Manages the rendering and real-time filtering of the 'All Courses' catalogue list.
 * @param {string} [message=""] - Status feedback.
 * @param {string} [type=""] - Feedback severity.
 * @returns {void} No return value.
 */
function renderAllCoursesList(message = "", type = "") {
  const courses = allCoursesQuery
    ? allCourses.filter((c) => String(c.title).toLowerCase().includes(allCoursesQuery) || String(c.code).toLowerCase().includes(allCoursesQuery))
    : allCourses;
  renderAllCoursesScreen(courses, allCoursesQuery);
  bindAllCoursesSearch((query) => {
    allCoursesQuery = query.trim().toLowerCase();
    const next = allCoursesQuery
      ? allCourses.filter((c) => String(c.title).toLowerCase().includes(allCoursesQuery) || String(c.code).toLowerCase().includes(allCoursesQuery))
      : allCourses;
    renderAllCoursesList(
      allCoursesQuery ? `Search returned ${next.length} course(s).` : `Loaded ${next.length} course(s).`,
      next.length || !allCoursesQuery ? "success" : "error"
    );
  });
  bindCourseSelect((courseId) => openCourseDetails(courseId, "all"));
  if (message) setAllCoursesMessage(message, type);
}

/**
 * Fetches and displays a detailed profile for a specific course.
 * Preserves the navigation context to allow the user to return to their previous view.
 * @param {string|number} courseId - Unique identifier for the course.
 * @param {string} context - The origin view ('all', 'create', 'details').
 * @returns {Promise<void>} Resolves once the details screen is rendered.
 */
async function openCourseDetails(courseId, context) {
  const token = loadToken();
  if (!token) return;
  selectedContext = context;
  selectedCourse = normalizeCourse(await fetchCourseById(courseId, token));
  renderSelectedCourseDetails();
}

/**
 * Renders render selected course details.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
function renderSelectedCourseDetails(message = "", type = "") {
  renderCourseDetailsScreen(selectedCourse);
  bindCourseDetailsActions({
    onUpdate: openUpdateCourse,
    onAddToProgram: (courseId) => openCourseProgram(courseId, selectedContext),
    onDelete: submitDeleteCourse,
    onClose: closeCourseDetails
  });
  if (message) setCourseDetailsMessage(message, type);
}

/**
 * Returns the user to the view from which they accessed course details.
 * @returns {void} Triggers a UI pivot back to the origin context.
 */
function closeCourseDetails() {
  if (selectedContext === "all") return renderAllCoursesList();
  if (selectedContext === "create") return openCreateCourse();
  renderLookup();
}

/**
 * UI trigger to switch the current course view into edit mode.
 * @param {string|number} courseId - The course to be updated.
 * @returns {void} Renders the update form.
 */
function openUpdateCourse(courseId) {
  if (!selectedCourse || String(selectedCourse.id) !== String(courseId)) return;
  renderCourseUpdateForm(selectedCourse);
  bindCourseUpdateForm(submitCourseUpdate, () => renderSelectedCourseDetails());
}

/**
 * Submits modified course data (title and credit units) to the server.
 * Ensures data integrity and refreshes local caches on success.
 * @param {object} payload - The updated course fields.
 * @returns {Promise<void>} Resolves after the update is confirmed by the backend.
 */
async function submitCourseUpdate(payload) {
  const token = loadToken();
  if (!token) return;
  if (!payload.title) return setUpdateCourseMessage("Course title is required.", "error");
  if (!Number.isInteger(payload.creditUnits) || payload.creditUnits < 0) {
    return setUpdateCourseMessage("Credit units must be a whole number that is zero or greater.", "error");
  }
  setUpdateCourseSubmitting(true);
  try {
    const updated = await updateCourse(payload.courseId, { title: payload.title, creditUnits: payload.creditUnits }, token);
    selectedCourse = normalizeCourse({ ...selectedCourse, ...(updated || {}), ...payload });
    upsertCourse(selectedCourse);
    renderSelectedCourseDetails("Course updated successfully.", "success");
  } catch (error) {
    setUpdateCourseMessage(error.message || "Failed to update course.", "error");
  } finally {
    setUpdateCourseSubmitting(false);
  }
}

/**
 * Initiates the course deletion sequence after administrator confirmation.
 * Handles cleanup across global and contextual course lists.
 * @param {string|number} courseId - The ID of the course to be permanently removed.
 * @returns {Promise<void>} Resolves when the course is purged and navigation is updated.
 */
async function submitDeleteCourse(courseId) {
  if (!window.confirm(`Delete course "${selectedCourse?.title || selectedCourse?.code || "selected"}"?`)) return;
  const token = loadToken();
  if (!token) return;
  try {
    await deleteCourse(courseId, token);
    removeCourse(courseId);
    if (selectedContext === "all") return renderAllCoursesList("Course deleted successfully.", "success");
    if (selectedContext === "create") {
      createdCourse = null;
      await openCreateCourse();
      return setCreateCourseMessage("Course deleted successfully.", "success");
    }
    lookup.courses = lookup.courses.filter((c) => String(c.id || c.courseId) !== String(courseId));
    renderLookup("Course deleted successfully.", "success");
  } catch (error) {
    setCourseDetailsMessage(error.message || "Failed to delete course.", "error");
  }
}

/**
 * Orchestrates the workflow for associating a course with a specific academic program.
 * Prepares the program offering form with school-specific program lists.
 * @param {string|number} courseId - The course being offered.
 * @param {string} context - Navigation context.
 * @returns {Promise<void>} Resolves once the mapping form is displayed.
 */
async function openCourseProgram(courseId, context) {
  const token = loadToken();
  if (!token) return;
  selectedContext = context;
  selectedCourse =
    selectedCourse && String(selectedCourse.id) === String(courseId)
      ? selectedCourse
      : normalizeCourse(await fetchCourseById(courseId, token));
  if (schools.length === 0) schools = normalizeCollection(await fetchAllSchoolsForPrograms(token));
  const schoolId = selectedCourse.schoolId || "";
  const departments = schoolId ? await getDepartments(schoolId, token) : [];
  const programs = schoolId ? await getPrograms(schoolId, token) : [];
  const filteredPrograms = selectedCourse.departmentId
    ? programs.filter((p) => String(p.departmentId || "") === String(selectedCourse.departmentId))
    : programs;
  programFormSchoolId = schoolId;
  renderCourseProgramForm({
    course: selectedCourse,
    schools,
    departments,
    programs: filteredPrograms,
    selectedSchoolId: schoolId,
    selectedDepartmentId: selectedCourse.departmentId || ""
  });
  bindCourseProgramSchoolChange(onProgramSchoolChange);
  bindCourseProgramDepartmentChange(onProgramDepartmentChange);
  bindCourseProgramForm(submitCourseProgram, () => renderSelectedCourseDetails());
}

/**
 * Executes on program school change.
 * @param {string|number} schoolId
 * @returns {Promise<*>}
 */
async function onProgramSchoolChange(schoolId) {
  const token = loadToken();
  if (!token) return;
  programFormSchoolId = schoolId;
  if (!schoolId) {
    setCourseProgramDepartmentOptions([]);
    setCourseProgramOptions([]);
    return;
  }
  setCourseProgramDepartmentOptions(await getDepartments(schoolId, token));
  setCourseProgramOptions(await getPrograms(schoolId, token));
}

/**
 * Executes on program department change.
 * @param {string|number} departmentId
 * @returns {Promise<*>}
 */
async function onProgramDepartmentChange(departmentId) {
  const token = loadToken();
  if (!token || !programFormSchoolId) return;
  const programs = await getPrograms(programFormSchoolId, token);
  const filtered = departmentId ? programs.filter((p) => String(p.departmentId || "") === String(departmentId)) : programs;
  setCourseProgramOptions(filtered);
}

/**
 * Processes the final association of a course to a program with specific metadata.
 * Defines the course category (Core/Elective) and the progression year.
 * @param {object} payload - Mapping data including programId, type, and year.
 * @returns {Promise<void>} Resolves after the relationship is saved.
 */
async function submitCourseProgram(payload) {
  const token = loadToken();
  if (!token) return;
  if (!payload.programId || !payload.courseType || !payload.yearOfStudy) {
    return setCourseProgramMessage("Program, course type, and year of study are required.", "error");
  }
  setCourseProgramSubmitting(true);
  try {
    await addCourseToProgram(payload.programId, payload.courseId, { courseType: payload.courseType, yearOfStudy: Number(payload.yearOfStudy) }, token);
    setCourseProgramMessage("Course added to program successfully.", "success");
  } catch (error) {
    setCourseProgramMessage(error.message || "Failed to add course to program.", "error");
  } finally {
    setCourseProgramSubmitting(false);
  }
}

/**
 * Gets get departments.
 * @param {string|number} schoolId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function getDepartments(schoolId, token) {
  if (!departmentsBySchool.has(schoolId)) {
    departmentsBySchool.set(schoolId, normalizeCollection(await fetchDepartmentsBySchoolForPrograms(schoolId, token)));
  }
  return departmentsBySchool.get(schoolId);
}

/**
 * Gets get programs.
 * @param {string|number} schoolId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function getPrograms(schoolId, token) {
  if (!programsBySchool.has(schoolId)) {
    programsBySchool.set(schoolId, normalizeCollection(await fetchProgramsBySchool(schoolId, token)));
  }
  return programsBySchool.get(schoolId);
}

/**
 * Gets get program courses with offerings.
 * @param {string|number} programId
 * @param {string} token
 * @returns {Promise<*>}
 */
async function getProgramCoursesWithOfferings(programId, token) {
  const [base, offered] = await Promise.all([fetchCoursesByProgram(programId, token), fetchProgramCourses(programId, token)]);
  const baseCourses = normalizeCourses(base);
  const offeredCourses = normalizeCourses(offered);
  const offeredById = new Map(offeredCourses.map((c) => [String(c.id || c.courseId), c]));
  return baseCourses.map((course) => {
    const match = offeredById.get(String(course.id)) || {};
    return { ...course, courseType: match.courseType || "", yearOfStudy: match.yearOfStudy || "" };
  });
}

/**
 * Executes filter program courses.
 * @param {Array<*>} courses
 * @param {string|number} departmentId
 * @param {*} year
 * @returns {*}
 */
function filterProgramCourses(courses, departmentId, year) {
  return courses.filter((course) => {
    const dep = !departmentId || String(course.departmentId || "") === String(departmentId);
    const yr = Number(year) === 0 || Number(course.yearOfStudy || 0) === Number(year);
    return dep && yr;
  });
}

/**
 * Normalizes normalize courses.
 * @param {*} response
 * @returns {*}
 */
function normalizeCourses(response) {
  return normalizeCollection(response).map(normalizeCourse);
}

/**
 * Normalizes normalize course.
 * @param {object} course
 * @returns {*}
 */
function normalizeCourse(course) {
  return {
    ...course,
    id: course?.id || course?.courseId || "",
    title: course?.title || course?.courseTitle || "",
    code: course?.code || course?.courseCode || "",
    schoolName: course?.schoolName || course?.SchoolName || "",
    schoolCode: course?.schoolCode || course?.SchoolCode || "",
    departmentName: course?.departmentName || course?.DepartmentName || "",
    departmentCode: course?.departmentCode || "",
    schoolId: course?.schoolId || "",
    departmentId: course?.departmentId || "",
    creditUnits: course?.creditUnits,
    courseType: course?.courseType || "",
    yearOfStudy: course?.yearOfStudy || ""
  };
}

/**
 * Standardizes API response payloads into a flat array of course objects.
 * Navigates through common result wrappers autonomously.
 * @param {*} data - The raw response data.
 * @returns {Array<object>} A guaranteed list of course items.
 */
function normalizeCollection(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const keys = ["data", "courses", "programs", "departments", "schools", "items", "results", "content"];
  for (const key of keys) if (Array.isArray(data[key])) return data[key];
  if (data.id || data.courseId || data.title || data.code) return [data];
  return [];
}

/**
 * Executes upsert course.
 * @param {object} course
 * @returns {*}
 */
function upsertCourse(course) {
  allCourses = upsertById(allCourses, course);
  if (lookup.courses.length) lookup.courses = upsertById(lookup.courses, course);
}

/**
 * Executes remove course.
 * @param {string|number} courseId
 * @returns {*}
 */
function removeCourse(courseId) {
  allCourses = allCourses.filter((c) => String(c.id) !== String(courseId));
  lookup.courses = lookup.courses.filter((c) => String(c.id || c.courseId) !== String(courseId));
}

/**
 * Internal logic for updating an item in a list or appending it if missing.
 * Used to maintain synchronized local cache states.
 * @param {Array<object>} items - The list to update.
 * @param {object} item - The object to upsert.
 * @returns {Array<object>} The new, updated list.
 */
function upsertById(items, item) {
  const list = [...items];
  const idx = list.findIndex((x) => String(x.id || x.courseId) === String(item.id));
  if (idx >= 0) list[idx] = { ...list[idx], ...item };
  else list.push(item);
  return list;
}
