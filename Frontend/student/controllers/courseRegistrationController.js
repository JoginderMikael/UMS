/**
 * @fileoverview Controller for student course registration workflows.
 * @module student/controllers/courseRegistrationController
 */
import {
  fetchAllUniversityCourses,
  fetchProgramAffiliatedCourses,
  fetchProgramCurriculumCourses,
  fetchSchoolCourses,
  registerStudentCourse,
  registerStudentCoursesBulk
} from "../models/courseRegistrationModel.js";
import {
  bindCourseRegistrationActions,
  renderCourseRegistrationCatalog
} from "../views/courseRegistrationView.js";

/**
 * Initializes course registration section.
 * @param {object} params - Initialization arguments.
 * @param {string} params.token - Authorization token.
 * @param {string} params.studentId - Student identifier.
 * @param {string} params.programId - Program identifier from /users/me.
 * @param {string} params.schoolId - School identifier.
 * @param {number} params.studentYearOfStudy - Student year of study.
 * @param {Array<object>} params.initialRegisteredCourses - Initially loaded registered courses.
 * @param {Function} params.onStatusMessage - Dashboard-level status callback.
 * @param {Function} params.onRegisteredCoursesRefresh - Refresh callback after successful registration.
 */
export async function initCourseRegistrationController({
  token,
  studentId,
  programId,
  schoolId,
  studentYearOfStudy,
  initialRegisteredCourses = [],
  onStatusMessage,
  onRegisteredCoursesRefresh
}) {
  const registrationState = {
    token,
    studentId,
    programId: String(programId || ""),
    schoolId: String(schoolId || ""),
    studentYearOfStudy: normalizeYearOfStudy(studentYearOfStudy),
    affiliatedCourses: [],
    otherCourses: [],
    selectedCourseIds: new Set(),
    registeredCourseIds: collectRegisteredCourseIds(initialRegisteredCourses),
    showOtherCourses: false,
    otherSearchQuery: ""
  };

  if (!registrationState.studentId) {
    return;
  }

  if (!registrationState.programId && onStatusMessage) {
    onStatusMessage("Program ID is missing from /users/me profile; affiliated courses cannot be loaded.", "error");
  }

  const [affiliatedCourses, schoolCourses] = await Promise.all([
    safeLoadProgramAffiliatedCourses(
      registrationState.programId,
      registrationState.studentYearOfStudy,
      registrationState.token
    ),
    safeLoadSchoolCourses(registrationState.schoolId, registrationState.token)
  ]);

  const normalizedAffiliatedCourses = dedupeCatalogCourses(affiliatedCourses.map(normalizeCatalogCourse));
  const normalizedSchoolCourses = dedupeCatalogCourses(schoolCourses.map(normalizeCatalogCourse));
  const yearFilteredAffiliatedCourses = filterAffiliatedCoursesForStudentYear(
    normalizedAffiliatedCourses,
    registrationState.studentYearOfStudy
  );
  const affiliatedCourseIds = new Set(
    yearFilteredAffiliatedCourses.map((item) => String(item.courseId || "")).filter(Boolean)
  );

  registrationState.affiliatedCourses = yearFilteredAffiliatedCourses;
  registrationState.otherCourses = normalizedSchoolCourses.filter(
    (item) => !affiliatedCourseIds.has(String(item.courseId || ""))
  );

  const renderRegistrationCatalog = () => {
    renderCourseRegistrationCatalog({
      affiliatedCourses: registrationState.affiliatedCourses,
      otherCourses: filterCatalogCourses(registrationState.otherCourses, registrationState.otherSearchQuery),
      selectedCourseIds: registrationState.selectedCourseIds,
      registeredCourseIds: registrationState.registeredCourseIds,
      showOtherCourses: registrationState.showOtherCourses,
      otherSearchQuery: registrationState.otherSearchQuery
    });

    bindCourseRegistrationActions({
      onRegisterSingle: async (courseId, courseCode) => {
        if (!courseId || registrationState.registeredCourseIds.has(String(courseId))) {
          return;
        }

        if (onStatusMessage) {
          onStatusMessage(`Registering ${courseCode || "selected course"}...`);
        }

        try {
          await registerStudentCourse(registrationState.studentId, courseId, registrationState.token);
          registrationState.selectedCourseIds.delete(String(courseId));
          await refreshRegisteredCourses();
          if (onStatusMessage) {
            onStatusMessage(`Course ${courseCode || ""} registered successfully.`, "success");
          }
          renderRegistrationCatalog();
        } catch (error) {
          if (onStatusMessage) {
            onStatusMessage(error.message || "Failed to register course.", "error");
          }
        }
      },
      onRegisterSelected: async () => {
        const selectedCourseIds = [...registrationState.selectedCourseIds].filter(
          (courseId) => !registrationState.registeredCourseIds.has(String(courseId))
        );
        if (selectedCourseIds.length === 0) {
          if (onStatusMessage) {
            onStatusMessage("Select one or more unregistered courses first.", "error");
          }
          return;
        }

        if (onStatusMessage) {
          onStatusMessage(`Registering ${selectedCourseIds.length} selected course(s)...`);
        }

        try {
          await registerStudentCoursesBulk(registrationState.studentId, selectedCourseIds, registrationState.token);
          registrationState.selectedCourseIds.clear();
          await refreshRegisteredCourses();
          if (onStatusMessage) {
            onStatusMessage("Selected courses registered successfully.", "success");
          }
          renderRegistrationCatalog();
        } catch (error) {
          if (onStatusMessage) {
            onStatusMessage(error.message || "Failed to register selected courses.", "error");
          }
        }
      },
      onToggleOtherCourses: () => {
        registrationState.showOtherCourses = !registrationState.showOtherCourses;
        renderRegistrationCatalog();
      },
      onSearchOtherCourses: (query) => {
        registrationState.otherSearchQuery = String(query || "").trim();
        renderRegistrationCatalog();
      },
      onSelectCourse: (courseId, isSelected) => {
        const normalizedCourseId = String(courseId || "");
        if (!normalizedCourseId || registrationState.registeredCourseIds.has(normalizedCourseId)) {
          return;
        }
        if (isSelected) {
          registrationState.selectedCourseIds.add(normalizedCourseId);
        } else {
          registrationState.selectedCourseIds.delete(normalizedCourseId);
        }
        renderRegistrationCatalog();
      }
    });
  };

  const refreshRegisteredCourses = async () => {
    if (!onRegisteredCoursesRefresh) {
      return;
    }
    const refreshedCourses = await onRegisteredCoursesRefresh();
    registrationState.registeredCourseIds = collectRegisteredCourseIds(refreshedCourses);
  };

  renderRegistrationCatalog();
}

async function safeLoadProgramAffiliatedCourses(programId, studentYearOfStudy, token) {
  if (!programId) {
    return [];
  }

  try {
    const detailedCourses = await fetchProgramCurriculumCourses(programId, token);
    return filterProgramAffiliatedCoursesByYear(detailedCourses, studentYearOfStudy);
  } catch (error) {
    console.error("Fetch detailed program curriculum courses failed:", error);
  }

  try {
    return await fetchProgramAffiliatedCourses(programId, token);
  } catch (error) {
    console.error("Fetch minimal program affiliated courses failed:", error);
    return [];
  }
}

async function safeLoadSchoolCourses(schoolId, token) {
  try {
    if (schoolId) {
      return await fetchSchoolCourses(schoolId, token);
    }
    return await fetchAllUniversityCourses(token);
  } catch (error) {
    console.error("Fetch school/university courses failed:", error);
    return [];
  }
}

function normalizeCatalogCourse(item) {
  const data = item && typeof item === "object" ? item : {};
  const courseEntity =
    (data.course && typeof data.course === "object" ? data.course : null) ||
    (data.courseDto && typeof data.courseDto === "object" ? data.courseDto : null) ||
    (data.courseResponse && typeof data.courseResponse === "object" ? data.courseResponse : null) ||
    (data.courseDetails && typeof data.courseDetails === "object" ? data.courseDetails : null) ||
    (data.courseInfo && typeof data.courseInfo === "object" ? data.courseInfo : null) ||
    null;
  const rawCourseId =
    data.courseId ||
    data.CourseId ||
    data.course_id ||
    data.id ||
    courseEntity?.courseId ||
    courseEntity?.CourseId ||
    courseEntity?.course_id ||
    courseEntity?.id ||
    "";
  const rawCourseCode =
    data.courseCode ||
    data.CourseCode ||
    data.course_code ||
    data.code ||
    courseEntity?.courseCode ||
    courseEntity?.CourseCode ||
    courseEntity?.course_code ||
    courseEntity?.code ||
    "";
  const rawCourseTitle =
    data.courseTitle ||
    data.CourseTitle ||
    data.course_title ||
    data.title ||
    data.name ||
    courseEntity?.courseTitle ||
    courseEntity?.CourseTitle ||
    courseEntity?.course_title ||
    courseEntity?.title ||
    courseEntity?.name ||
    "";
  const rawCourseType =
    data.courseType ||
    data.CourseType ||
    data.type ||
    courseEntity?.courseType ||
    courseEntity?.CourseType ||
    courseEntity?.type ||
    "";
  const rawYearOfStudy =
    data.yearOfStudy ||
    data.YearOfStudy ||
    data.studyYear ||
    data.year ||
    courseEntity?.yearOfStudy ||
    courseEntity?.YearOfStudy ||
    courseEntity?.studyYear ||
    courseEntity?.year ||
    "";

  return {
    courseId: String(rawCourseId || ""),
    courseCode: String(rawCourseCode || ""),
    courseTitle: String(rawCourseTitle || ""),
    creditUnits: data.creditUnits ?? data.credits ?? courseEntity?.creditUnits ?? courseEntity?.credits ?? "",
    courseType: String(rawCourseType || "").toUpperCase(),
    yearOfStudy: normalizeYearOfStudy(rawYearOfStudy),
    schoolId: String(data.schoolId || courseEntity?.schoolId || ""),
    departmentId: String(data.departmentId || courseEntity?.departmentId || ""),
    departmentName:
      data.departmentName ||
      data.DepartmentName ||
      data.departmentCode ||
      courseEntity?.departmentName ||
      courseEntity?.DepartmentName ||
      courseEntity?.departmentCode ||
      ""
  };
}

function dedupeCatalogCourses(courses) {
  const seen = new Set();
  const list = [];
  courses.forEach((course) => {
    const courseId = String(course?.courseId || "");
    const fallbackKey = String(course?.courseCode || course?.courseTitle || "");
    const uniqueKey = courseId || fallbackKey;
    if (!uniqueKey || seen.has(uniqueKey)) {
      return;
    }
    seen.add(uniqueKey);
    list.push(course);
  });
  return list;
}

function filterCatalogCourses(courses, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return courses;
  }

  return courses.filter((course) => {
    const code = String(course.courseCode || "").toLowerCase();
    const title = String(course.courseTitle || "").toLowerCase();
    return code.includes(normalizedQuery) || title.includes(normalizedQuery);
  });
}

function collectRegisteredCourseIds(courses) {
  return new Set(
    (Array.isArray(courses) ? courses : [])
      .map((course) => String(course.courseId || ""))
      .filter(Boolean)
  );
}

function normalizeYearOfStudy(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const numeric = Math.trunc(value);
    return numeric > 0 ? numeric : 0;
  }

  const text = String(value || "");
  const matched = text.match(/\d+/);
  if (!matched) {
    return 0;
  }

  const numeric = Number(matched[0]);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function filterProgramAffiliatedCoursesByYear(courses, studentYearOfStudy) {
  const targetYear = normalizeYearOfStudy(studentYearOfStudy);
  if (!targetYear) {
    return Array.isArray(courses) ? courses : [];
  }

  const filtered = (Array.isArray(courses) ? courses : []).filter((course) => {
    const type = String(course?.courseType || course?.type || "").toUpperCase();
    const year = normalizeYearOfStudy(course?.yearOfStudy || course?.studyYear || course?.year);
    if (type !== "CORE") {
      return true;
    }
    if (!year) {
      return true;
    }
    return year === targetYear;
  });

  if (filtered.length === 0 && Array.isArray(courses) && courses.length > 0) {
    return courses;
  }

  return filtered;
}

function filterAffiliatedCoursesForStudentYear(courses, studentYearOfStudy) {
  const targetYear = normalizeYearOfStudy(studentYearOfStudy);
  if (!targetYear) {
    return Array.isArray(courses) ? courses : [];
  }

  return (Array.isArray(courses) ? courses : []).filter((course) => {
    const year = normalizeYearOfStudy(course?.yearOfStudy || course?.studyYear || course?.year);
    return year === targetYear;
  });
}
