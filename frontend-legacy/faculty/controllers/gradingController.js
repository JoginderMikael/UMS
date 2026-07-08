/**
 * @fileoverview Controller for faculty grading workflows.
 * @module faculty/controllers/gradingController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import {
  dedupeById,
  fetchAcademicYears,
  fetchAllCourses,
  fetchCoursesByDepartment,
  fetchCoursesByProgram,
  fetchCoursesBySchool,
  fetchDepartmentsBySchool,
  fetchProgramsByDepartment,
  fetchProgramsBySchool,
  fetchSchools,
  fetchSemestersByAcademicYear,
  fetchStudentByRegistrationNumber,
  fetchStudentExamStatusesForCourses,
  normalizeAcademicYear,
  normalizeCourse,
  normalizeDepartment,
  normalizeExamStatus,
  normalizeProgram,
  normalizeSchool,
  normalizeSemester,
  normalizeStudent,
  submitStudentGrade
} from "../models/gradingModel.js";
import {
  bindAcademicYearChange,
  bindCourseChange,
  bindDepartmentChange,
  bindGradeSubmit,
  bindProgramChange,
  bindSchoolChange,
  bindScopeChange,
  bindStudentSearch,
  queryGradingElements,
  renderSelectOptions,
  setGradeSubmitDisabled,
  setGradingMessage,
  setScopeControls,
  setStudentResult
} from "../views/gradingView.js";

export function initFacultyGradingController() {
  const token = loadToken();
  const elements = queryGradingElements();
  if (!token || !elements) {
    return;
  }

  const state = {
    token,
    scope: "school",
    schools: [],
    departments: [],
    programs: [],
    courses: [],
    academicYears: [],
    semesters: [],
    selectedStudent: null,
    selectedStudentExamStatuses: [],
    examStatusLookupAvailable: true
  };

  const setMessage = (text, type = "") => setGradingMessage(elements, text, type);

  const renderSchools = () => {
    renderSelectOptions(
      elements.schoolSelect,
      state.schools,
      (item) => item.schoolId,
      (item) => `${item.name}${item.code ? ` (${item.code})` : ""}`,
      "No schools available"
    );
  };

  const renderDepartments = (emptyLabel = "No departments available") => {
    renderSelectOptions(
      elements.departmentSelect,
      state.departments,
      (item) => item.departmentId,
      (item) => `${item.name}${item.code ? ` (${item.code})` : ""}`,
      emptyLabel
    );
  };

  const renderPrograms = (emptyLabel = "No programs available") => {
    renderSelectOptions(
      elements.programSelect,
      state.programs,
      (item) => item.programId,
      (item) => `${item.name}${item.code ? ` (${item.code})` : ""}`,
      emptyLabel
    );
  };

  const renderCourses = (emptyLabel = "No courses available") => {
    renderSelectOptions(
      elements.courseSelect,
      state.courses,
      (item) => item.courseId,
      (item) => `${item.code || "N/A"} - ${item.title || "Untitled Course"}`,
      emptyLabel
    );
  };

  const renderAcademicYears = () => {
    renderSelectOptions(
      elements.academicYearSelect,
      state.academicYears,
      (item) => item.academicYearId,
      (item) => `${item.name}${item.active ? " (Active)" : ""}`,
      "No academic years available"
    );
  };

  const renderSemesters = (emptyLabel = "No semesters available") => {
    renderSelectOptions(
      elements.semesterSelect,
      state.semesters,
      (item) => item.semesterId,
      (item) => `${item.name || `Semester ${item.number || ""}`}${item.active ? " (Active)" : ""}`,
      emptyLabel
    );
  };

  const loadSchoolsAndRender = async () => {
    state.schools = (await fetchSchools(state.token)).map(normalizeSchool);
    renderSchools();
  };

  const loadDepartmentsBySchoolAndRender = async () => {
    const schoolId = elements.schoolSelect.value;
    if (!schoolId) {
      state.departments = [];
      renderDepartments("Select a school first");
      return;
    }

    state.departments = (await fetchDepartmentsBySchool(schoolId, state.token)).map(normalizeDepartment);
    renderDepartments();
  };

  const loadProgramsByContextAndRender = async () => {
    if (state.scope !== "program") {
      state.programs = [];
      renderPrograms("Switch scope to Program");
      return;
    }

    const schoolId = elements.schoolSelect.value;
    const departmentId = elements.departmentSelect.value;

    if (departmentId) {
      state.programs = (await fetchProgramsByDepartment(departmentId, state.token)).map(normalizeProgram);
    } else if (schoolId) {
      state.programs = (await fetchProgramsBySchool(schoolId, state.token)).map(normalizeProgram);
    } else {
      state.programs = [];
    }

    renderPrograms();
  };

  const loadCoursesByScopeAndRender = async () => {
    if (state.scope === "program") {
      const programId = elements.programSelect.value;
      if (!programId) {
        state.courses = [];
        renderCourses("Select a program first");
        return;
      }
      state.courses = (await fetchCoursesByProgram(programId, state.token)).map(normalizeCourse);
    } else if (state.scope === "department") {
      const departmentId = elements.departmentSelect.value;
      if (!departmentId) {
        state.courses = [];
        renderCourses("Select a department first");
        return;
      }
      state.courses = (await fetchCoursesByDepartment(departmentId, state.token)).map(normalizeCourse);
    } else if (state.scope === "school") {
      const schoolId = elements.schoolSelect.value;
      if (!schoolId) {
        state.courses = [];
        renderCourses("Select a school first");
        return;
      }
      state.courses = (await fetchCoursesBySchool(schoolId, state.token)).map(normalizeCourse);
    } else {
      state.courses = (await fetchAllCourses(state.token)).map(normalizeCourse);
    }

    state.courses = dedupeById(state.courses, (item) => item.courseId || item.code);
    renderCourses();
  };

  const loadAcademicYearsAndRender = async () => {
    state.academicYears = (await fetchAcademicYears(state.token)).map(normalizeAcademicYear);
    state.academicYears.sort((a, b) => Number(b.active) - Number(a.active));
    renderAcademicYears();
  };

  const loadSemestersAndRender = async () => {
    const academicYearId = elements.academicYearSelect.value;
    if (!academicYearId) {
      state.semesters = [];
      renderSemesters("Select academic year first");
      return;
    }

    state.semesters = (await fetchSemestersByAcademicYear(academicYearId, state.token)).map(normalizeSemester);
    state.semesters.sort((a, b) => Number(b.active) - Number(a.active));
    renderSemesters();
  };

  const reloadCourseScope = async () => {
    state.scope = elements.scopeSelect.value;
    setScopeControls(elements, state.scope);
    await loadDepartmentsBySchoolAndRender();
    await loadProgramsByContextAndRender();
    await loadCoursesByScopeAndRender();
    refreshStudentExamStatusCard();
  };

  const resolveSelectedCourseExamStatus = () => {
    const selectedCourseId = String(elements.courseSelect.value || "");
    const selectedCourseLabel = String(
      elements.courseSelect.selectedOptions?.[0]?.textContent || ""
    ).trim();
    if (!selectedCourseId) {
      return null;
    }

    const status = state.selectedStudentExamStatuses.find(
      (item) => String(item.courseId || "") === selectedCourseId
    );

    return {
      courseId: selectedCourseId,
      courseLabel: selectedCourseLabel,
      examRegistered: Boolean(status?.examRegistered),
      unavailable: !state.examStatusLookupAvailable
    };
  };

  const refreshStudentExamStatusCard = () => {
    setStudentResult(elements, state.selectedStudent, resolveSelectedCourseExamStatus());
  };

  const searchStudent = async () => {
    const registrationNumber = elements.studentSearchInput.value.trim();
    if (!registrationNumber) {
      setMessage("Enter admission/registration number.", "error");
      return;
    }

    setMessage("Searching student...");

    try {
      const studentRaw = await fetchStudentByRegistrationNumber(registrationNumber, state.token);
      const student = normalizeStudent(studentRaw, registrationNumber);
      if (!student.studentId) {
        state.selectedStudent = null;
        state.selectedStudentExamStatuses = [];
        refreshStudentExamStatusCard();
        setMessage("Student was not found.", "error");
        return;
      }

      let examStatuses = [];
      state.examStatusLookupAvailable = true;
      try {
        examStatuses = await fetchStudentExamStatusesForCourses(student.studentId, state.token);
      } catch {
        state.examStatusLookupAvailable = false;
      }
      state.selectedStudent = student;
      state.selectedStudentExamStatuses = examStatuses.map(normalizeExamStatus);
      refreshStudentExamStatusCard();
      setMessage(
        state.examStatusLookupAvailable
          ? "Student selected successfully."
          : "Student selected. Exam status is currently unavailable.",
        state.examStatusLookupAvailable ? "success" : "error"
      );
    } catch (error) {
      state.selectedStudent = null;
      state.selectedStudentExamStatuses = [];
      state.examStatusLookupAvailable = false;
      refreshStudentExamStatusCard();
      setMessage(error.message || "Failed to search student.", "error");
    }
  };

  const submitGrade = async (event) => {
    event.preventDefault();

    const studentId = String(state.selectedStudent?.studentId || "");
    const courseId = String(elements.courseSelect.value || "");
    const semesterId = String(elements.semesterSelect.value || "");
    const marks = Number(elements.marksInput.value);

    if (!studentId) {
      setMessage("Search and select a student first.", "error");
      return;
    }

    if (!courseId || !semesterId) {
      setMessage("Course and semester are required.", "error");
      return;
    }

    if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
      setMessage("Marks must be between 0 and 100.", "error");
      return;
    }

    setGradeSubmitDisabled(elements, true);
    setMessage("Submitting grade...");

    try {
      await submitStudentGrade({ studentId, courseId, semesterId, marks }, state.token);
      setMessage("Grade successfully updated.", "success");
    } catch (error) {
      setMessage(error.message || "Failed to submit grade.", "error");
    } finally {
      setGradeSubmitDisabled(elements, false);
    }
  };

  bindScopeChange(elements, async () => {
    try {
      setMessage("Loading courses...");
      await reloadCourseScope();
      setMessage("Course filters updated.", "success");
    } catch (error) {
      setMessage(error.message || "Failed to update scope.", "error");
    }
  });

  bindSchoolChange(elements, async () => {
    try {
      setMessage("Loading school context...");
      await loadDepartmentsBySchoolAndRender();
      await loadProgramsByContextAndRender();
      await loadCoursesByScopeAndRender();
      setMessage("School filters updated.", "success");
    } catch (error) {
      setMessage(error.message || "Failed to load school filters.", "error");
    }
  });

  bindDepartmentChange(elements, async () => {
    try {
      setMessage("Loading department context...");
      await loadProgramsByContextAndRender();
      await loadCoursesByScopeAndRender();
      setMessage("Department filters updated.", "success");
    } catch (error) {
      setMessage(error.message || "Failed to load department filters.", "error");
    }
  });

  bindProgramChange(elements, async () => {
    try {
      setMessage("Loading program courses...");
      await loadCoursesByScopeAndRender();
      setMessage("Program courses loaded.", "success");
    } catch (error) {
      setMessage(error.message || "Failed to load program courses.", "error");
    }
  });

  bindCourseChange(elements, () => {
    if (state.selectedStudent) {
      refreshStudentExamStatusCard();
    }
  });

  bindAcademicYearChange(elements, async () => {
    try {
      setMessage("Loading semesters...");
      await loadSemestersAndRender();
      setMessage("Semesters loaded.", "success");
    } catch (error) {
      setMessage(error.message || "Failed to load semesters.", "error");
    }
  });

  bindStudentSearch(elements, searchStudent);
  bindGradeSubmit(elements, submitGrade);

  (async () => {
    try {
      setMessage("Loading grading context...");
      refreshStudentExamStatusCard();
      await loadSchoolsAndRender();
      await loadAcademicYearsAndRender();
      await loadSemestersAndRender();
      await reloadCourseScope();
      setMessage("Ready for grade entry.", "success");
    } catch (error) {
      setMessage(error.message || "Failed to load grading setup.", "error");
    }
  })();
}
