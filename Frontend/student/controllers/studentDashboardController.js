/**
 * @fileoverview Controller for student dashboard data loading and rendering.
 * @module student/controllers/studentDashboardController
 */
import { fetchCurrentUser } from "../../scripts/models/authModel.js";
import { loadCurrentUser, loadToken, saveCurrentUser } from "../../scripts/models/sessionModel.js";
import { fetchAllAcademicYears } from "../../scripts/models/academicYearModel.js";
import { fetchSemestersByAcademicYear } from "../../admin/models/academicYearModel.js";
import { fetchAllProgramsMinimal } from "../../admin/models/programModel.js";
import {
  renderStudentOverview,
  setStudentDashboardMessage
} from "../views/studentDashboardView.js";
import {
  fetchStudentExamStatuses,
  fetchStudentFeeStatus,
  fetchStudentRegisteredCourses,
  fetchUserProfileById
} from "../models/studentDashboardModel.js";
import { initCourseRegistrationController } from "./courseRegistrationController.js";
import { initExamRegistrationController } from "./examRegistrationController.js";
import { initFeePaymentController } from "./feePaymentController.js";
import { initSemesterRegistrationController } from "./semesterRegistrationController.js";
import { initTranscriptController } from "./transcriptController.js";

/**
 * Initializes the student dashboard by coordinating data fetching for summary,
 * registered courses, fee status, and registration modules.
 * @returns {Promise<void>} Resolves when all dashboard sections are rendered.
 */
export async function initStudentDashboardController() {
  const token = loadToken();
  const localUser = loadCurrentUser();
  if (!token || !localUser) {
    return;
  }

  setStudentDashboardMessage("Loading student summary...");

  try {
    let currentUser = null;
    try {
      currentUser = await fetchCurrentUser(token);
    } catch (error) {
      console.error("Fetch current user for student dashboard failed:", error);
    }

    const programIdFromCurrentUser = resolveProgramIdFromCurrentUserPayload(unwrapEntity(currentUser));
    const mergedUser = normalizeStudentUser({
      ...unwrapEntity(localUser),
      ...unwrapEntity(currentUser)
    });
    const resolvedProgramId =
      programIdFromCurrentUser ||
      resolveProgramId(mergedUser) ||
      await safeResolveProgramIdByUserId(mergedUser, token) ||
      await safeResolveProgramIdByName(mergedUser, token);
    const mergedUserWithProgram = {
      ...mergedUser,
      programId: String(programIdFromCurrentUser || resolvedProgramId || "")
    };
    saveCurrentUser(mergedUserWithProgram);

    const studentId = resolveStudentId(mergedUserWithProgram);
    const academicContext = await resolveAcademicContext(mergedUserWithProgram, token);
    const [courses, examStatuses] = studentId
      ? await Promise.all([
        safeLoadCourses(studentId, token),
        safeLoadExamStatuses(studentId, token)
      ])
      : [[], []];

    let activeMergedCourses = mergeCoursesWithExamStatus(courses, examStatuses);
    let feeStatus =
      studentId && academicContext.activeSemesterId
        ? await safeLoadFeeStatus(studentId, academicContext.activeSemesterId, token)
        : null;

    renderStudentOverview({
      student: mergedUserWithProgram,
      feeStatus,
      academic: academicContext
    });
    updateHeroSnapshot(feeStatus, academicContext);

    const examRegistrationController = initExamRegistrationController({
      token,
      studentId,
      initialCourses: activeMergedCourses,
      feeCleared: resolveFeeCleared(feeStatus),
      onStatusMessage: setStudentDashboardMessage,
      onCoursesRefresh: async () => {
        activeMergedCourses = await reloadStudentCoursesWithExamStatus(studentId, token);
        return activeMergedCourses;
      }
    });

    initSemesterRegistrationController({
      token,
      studentId,
      academicContext,
      onStatusMessage: setStudentDashboardMessage
    });

    await initCourseRegistrationController({
      token,
      studentId,
      programId: mergedUserWithProgram.programId,
      schoolId: resolveSchoolId(mergedUserWithProgram),
      studentYearOfStudy: resolveYearOfStudyNumber(mergedUserWithProgram),
      initialRegisteredCourses: activeMergedCourses,
      onStatusMessage: setStudentDashboardMessage,
      onRegisteredCoursesRefresh: async () => {
        activeMergedCourses = await reloadStudentCoursesWithExamStatus(studentId, token);
        examRegistrationController.replaceCourses(activeMergedCourses);
        examRegistrationController.updateFeeStatus(resolveFeeCleared(feeStatus));
        return activeMergedCourses;
      }
    });

    initFeePaymentController({
      token,
      studentId,
      semesterId: academicContext.activeSemesterId,
      academicContext,
      initialFeeStatus: feeStatus,
      onStatusMessage: setStudentDashboardMessage,
      onFeeStatusRefresh: async () => {
        if (!studentId || !academicContext.activeSemesterId) {
          return feeStatus;
        }

        const refreshed = await safeLoadFeeStatus(studentId, academicContext.activeSemesterId, token);
        if (refreshed && typeof refreshed === "object") {
          feeStatus = refreshed;
          renderStudentOverview({
            student: mergedUserWithProgram,
            feeStatus,
            academic: academicContext
          });
          updateHeroSnapshot(feeStatus, academicContext);
          examRegistrationController.updateFeeStatus(resolveFeeCleared(feeStatus));
        }

        return feeStatus;
      }
    });

    await initTranscriptController({
      token,
      studentId,
      student: mergedUserWithProgram,
      onStatusMessage: setStudentDashboardMessage
    });

    setStudentDashboardMessage(studentId ? "Student summary loaded." : "Student summary loaded with limited data.", "success");
  } catch (error) {
    setStudentDashboardMessage(error.message || "Failed to load student dashboard.", "error");
    console.error("Student dashboard load failed:", error);
  }
}

async function resolveAcademicContext(user, token) {
  let years = [];
  try {
    const yearsResponse = await fetchAllAcademicYears(token);
    years = normalizeCollection(yearsResponse).map(normalizeAcademicYear);
  } catch (error) {
    console.error("Fetch academic years failed:", error);
  }
  const activeAcademicYear = findActiveAcademicYear(years, user);

  const activeAcademicYearId = String(
    activeAcademicYear?.academicYearId ||
    user.academicYearId ||
    user.activeAcademicYearId ||
    ""
  );
  const activeAcademicYearName =
    activeAcademicYear?.name ||
    user.activeAcademicYearName ||
    user.academicYearName ||
    user.academicYear ||
    "N/A";

  let activeSemesterId = String(user.semesterId || user.activeSemesterId || "");
  let activeSemesterName =
    user.semesterName ||
    user.semester ||
    user.activeSemesterName ||
    "";

  if ((!activeSemesterId || !activeSemesterName) && activeAcademicYearId) {
    try {
      const semestersResponse = await fetchSemestersByAcademicYear(activeAcademicYearId, token);
      const semesters = normalizeCollection(semestersResponse).map(normalizeSemester);
      const activeSemester =
        semesters.find((item) => item.active) ||
        semesters.find((item) => String(item.semesterId) === String(activeSemesterId)) ||
        semesters[0];

      if (activeSemester) {
        activeSemesterId = activeSemester.semesterId;
        activeSemesterName = activeSemester.name;
      }
    } catch (error) {
      console.error("Resolve active semester failed:", error);
    }
  }

  return {
    activeAcademicYearId,
    activeAcademicYearName,
    activeSemesterId,
    activeSemesterName: activeSemesterName || "N/A"
  };
}

function normalizeStudentUser(user) {
  const data = user && typeof user === "object" ? user : {};
  const studentEntity =
    (data.student && typeof data.student === "object" ? data.student : null) ||
    (data.studentProfile && typeof data.studentProfile === "object" ? data.studentProfile : null) ||
    null;
  const programEntity =
    (data.program && typeof data.program === "object" ? data.program : null) ||
    (studentEntity?.program && typeof studentEntity.program === "object" ? studentEntity.program : null) ||
    null;
  const schoolEntity =
    (data.school && typeof data.school === "object" ? data.school : null) ||
    (studentEntity?.school && typeof studentEntity.school === "object" ? studentEntity.school : null) ||
    null;
  const departmentEntity =
    (data.department && typeof data.department === "object" ? data.department : null) ||
    (studentEntity?.department && typeof studentEntity.department === "object" ? studentEntity.department : null) ||
    null;

  const academicYearEntity =
    (data.academicYear && typeof data.academicYear === "object" ? data.academicYear : null) ||
    (studentEntity?.academicYear && typeof studentEntity.academicYear === "object"
      ? studentEntity.academicYear
      : null) ||
    null;

  const semesterEntity =
    (data.semester && typeof data.semester === "object" ? data.semester : null) ||
    (studentEntity?.semester && typeof studentEntity.semester === "object"
      ? studentEntity.semester
      : null) ||
    null;

  const academicYearText = typeof data.academicYear === "string" ? data.academicYear : "";
  const semesterText = typeof data.semester === "string" ? data.semester : "";

  return {
    ...data,
    studentId: String(data.studentId || studentEntity?.studentId || studentEntity?.id || data.id || ""),
    programId: String(data.programId || programEntity?.programId || programEntity?.id || studentEntity?.programId || ""),
    schoolId: String(data.schoolId || schoolEntity?.schoolId || schoolEntity?.id || studentEntity?.schoolId || ""),
    departmentId: String(
      data.departmentId ||
      departmentEntity?.departmentId ||
      departmentEntity?.id ||
      studentEntity?.departmentId ||
      ""
    ),
    programName: data.programName || studentEntity?.programName || data.program || studentEntity?.program || "",
    schoolName: data.schoolName || studentEntity?.schoolName || data.school || studentEntity?.school || "",
    departmentName:
      data.departmentName ||
      studentEntity?.departmentName ||
      data.department ||
      studentEntity?.department ||
      "",
    academicYearId: String(
      data.academicYearId ||
      data.activeAcademicYearId ||
      academicYearEntity?.academicYearId ||
      academicYearEntity?.id ||
      ""
    ),
    academicYearName:
      data.academicYearName ||
      academicYearText ||
      data.activeAcademicYearName ||
      academicYearEntity?.name ||
      "",
    semesterId: String(data.semesterId || data.activeSemesterId || semesterEntity?.semesterId || semesterEntity?.id || ""),
    semesterName: data.semesterName || semesterText || data.activeSemesterName || semesterEntity?.name || "",
    yearOfStudy: data.yearOfStudy || data.studentYear || studentEntity?.yearOfStudy || ""
  };
}

function mergeCoursesWithExamStatus(courses, statuses) {
  const examByCourseId = new Map();
  statuses.forEach((item) => {
    const key = String(item.courseId || "");
    if (!key) {
      return;
    }
    examByCourseId.set(key, {
      examRegistered: Boolean(item.examRegistered)
    });
  });

  const normalizedCourses = courses.map((item) => {
    const record = normalizeCourse(item);
    const examInfo = examByCourseId.get(record.courseId);
    return {
      ...record,
      examRegistered: examInfo ? Boolean(examInfo.examRegistered) : Boolean(record.examRegistered)
    };
  });

  if (normalizedCourses.length > 0) {
    return normalizedCourses;
  }

  return statuses.map((item) => ({
    courseId: String(item.courseId || ""),
    courseCode: item.courseCode || "",
    courseTitle: item.courseTitle || "",
    creditUnits: item.creditUnits ?? "",
    examRegistered: Boolean(item.examRegistered)
  }));
}

function resolveStudentId(user) {
  const value = user?.studentId || user?.student?.studentId || user?.student?.id || "";
  return String(value || "");
}

function resolveProgramId(user) {
  const value =
    user?.programId ||
    user?.student?.programId ||
    user?.program?.programId ||
    user?.program?.id ||
    (isUuidLike(user?.program) ? user?.program : "") ||
    (isUuidLike(user?.student?.program) ? user?.student?.program : "") ||
    "";
  return String(value || "");
}

function resolveProgramIdFromCurrentUserPayload(payload) {
  const data = payload && typeof payload === "object" ? payload : {};
  const nestedStudent = data.student && typeof data.student === "object" ? data.student : null;
  const nestedProgram = data.program && typeof data.program === "object" ? data.program : null;

  const value =
    data.programId ||
    nestedStudent?.programId ||
    nestedProgram?.programId ||
    nestedProgram?.id ||
    (isUuidLike(data.program) ? data.program : "") ||
    "";

  return String(value || "");
}

function resolveSchoolId(user) {
  const value =
    user?.schoolId ||
    user?.student?.schoolId ||
    user?.school?.schoolId ||
    user?.school?.id ||
    "";
  return String(value || "");
}

function resolveYearOfStudyNumber(user) {
  return normalizeYearOfStudy(user?.yearOfStudy || user?.studentYear || user?.student?.yearOfStudy || 0);
}

function resolveUserId(user) {
  return String(user?.userId || user?.id || user?.student?.userId || "");
}

function isUuidLike(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

async function safeResolveProgramIdByUserId(user, token) {
  const userId = resolveUserId(user);
  if (!userId) {
    return "";
  }

  try {
    const profile = await fetchUserProfileById(userId, token);
    return resolveProgramId(unwrapEntity(profile));
  } catch (error) {
    console.error("Resolve program ID via /users/{id} failed:", error);
    return "";
  }
}

async function safeResolveProgramIdByName(user, token) {
  const candidateName = normalizeNameToken(
    user?.programName ||
    user?.program ||
    user?.student?.programName ||
    user?.student?.program ||
    ""
  );
  if (!candidateName) {
    return "";
  }

  try {
    const response = await fetchAllProgramsMinimal(token);
    const programs = normalizeCollection(response);
    const match = programs.find((program) => {
      const name = normalizeNameToken(program?.name || program?.programName || "");
      const code = normalizeNameToken(program?.code || program?.programCode || "");
      return name === candidateName || code === candidateName;
    });
    return String(match?.id || match?.programId || "");
  } catch (error) {
    console.error("Resolve program ID by name failed:", error);
    return "";
  }
}

function findActiveAcademicYear(years, user) {
  if (!Array.isArray(years) || years.length === 0) {
    return null;
  }

  const byActiveFlag = years.find((item) => item.active);
  if (byActiveFlag) {
    return byActiveFlag;
  }

  const byUserId = years.find(
    (item) =>
      String(item.academicYearId) ===
      String(user.academicYearId || user.activeAcademicYearId || "")
  );
  if (byUserId) {
    return byUserId;
  }

  return years.find((item) => item.active) || years[0];
}

function normalizeAcademicYear(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    academicYearId: String(data.academicYearId || data.id || ""),
    name: data.name || data.academicYearName || "",
    active: Boolean(data.active)
  };
}

function normalizeSemester(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    semesterId: String(data.semesterId || data.id || ""),
    name: data.name || `Semester ${data.number || data.semesterNumber || ""}`.trim(),
    active: Boolean(data.active)
  };
}

function normalizeCourse(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    registrationId: String(data.registrationId || ""),
    courseId: String(data.courseId || data.id || ""),
    courseCode: data.courseCode || data.code || "",
    courseTitle: data.courseTitle || data.title || data.name || "",
    creditUnits: data.creditUnits ?? data.credits ?? "",
    examRegistered: Boolean(data.examRegistered)
  };
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

function normalizeNameToken(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = ["data", "content", "items", "results", "academicYears", "semesters", "programs"];
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

  if (responseData.id || responseData.academicYearId || responseData.semesterId) {
    return [responseData];
  }

  return [];
}

function updateHeroSnapshot(feeStatus, academicContext) {
  const amountElement = document.querySelector(".wallet .amount");
  if (amountElement) {
    const balance = Number(feeStatus?.balance || 0);
    const sign = balance > 0 ? "+" : balance < 0 ? "-" : "";
    amountElement.textContent = `${sign}KES ${Math.abs(balance).toLocaleString()}`;
  }

  const semesterElement = document.querySelector(".wallet span");
  if (semesterElement) {
    const semesterText = academicContext?.activeSemesterName || "N/A";
    const yearText = academicContext?.activeAcademicYearName || "N/A";
    semesterElement.textContent = `${semesterText}, ${yearText}`;
  }
}

function resolveFeeCleared(feeStatus) {
  const data = feeStatus && typeof feeStatus === "object" ? feeStatus : null;
  if (!data) {
    return false;
  }

  const directBooleanCandidates = [
    data.cleared,
    data.feeCleared,
    data.isCleared,
    data.feesCleared
  ];
  for (const candidate of directBooleanCandidates) {
    if (typeof candidate === "boolean") {
      return candidate;
    }
  }

  const statusText = String(data.status || data.feeStatus || "").trim().toLowerCase();
  if (statusText) {
    if (statusText.includes("not cleared") || statusText.includes("pending") || statusText.includes("unpaid")) {
      return false;
    }
    if (statusText.includes("cleared") || statusText.includes("paid")) {
      return true;
    }
  }

  const requiredAmount = Number(data.requiredAmount);
  const amountPaid = Number(data.amountPaid);
  if (Number.isFinite(requiredAmount) && Number.isFinite(amountPaid) && requiredAmount > 0) {
    return amountPaid >= requiredAmount;
  }

  const balance = Number(data.balance);
  if (Number.isFinite(balance)) {
    return balance <= 0;
  }

  return false;
}

async function safeLoadCourses(studentId, token) {
  try {
    return await fetchStudentRegisteredCourses(studentId, token);
  } catch (error) {
    console.error("Fetch registered courses failed:", error);
    return [];
  }
}

async function safeLoadExamStatuses(studentId, token) {
  try {
    return await fetchStudentExamStatuses(studentId, token);
  } catch (error) {
    console.error("Fetch exam status failed:", error);
    return [];
  }
}

async function safeLoadFeeStatus(studentId, semesterId, token) {
  try {
    return await fetchStudentFeeStatus(studentId, semesterId, token);
  } catch (error) {
    console.error("Fetch student fee status failed:", error);
    return null;
  }
}

async function reloadStudentCoursesWithExamStatus(studentId, token) {
  const [courses, examStatuses] = await Promise.all([
    safeLoadCourses(studentId, token),
    safeLoadExamStatuses(studentId, token)
  ]);
  return mergeCoursesWithExamStatus(courses, examStatuses);
}

function unwrapEntity(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const wrapperKeys = ["data", "result", "item", "content", "payload", "record"];
  for (const key of wrapperKeys) {
    const nested = value[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return unwrapEntity(nested);
    }
  }

  return value;
}
