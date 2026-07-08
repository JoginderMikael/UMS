/**
 * @fileoverview API operations for faculty grading workflows.
 * @module faculty/models/gradingModel
 */
import { API_BASE_URL } from "../../scripts/models/apiConfig.js";

export async function fetchSchools(token) {
  return normalizeCollection(await apiGet("/schools/getAll", token));
}

export async function fetchDepartmentsBySchool(schoolId, token) {
  if (!schoolId) {
    return [];
  }
  return normalizeCollection(await apiGet(`/${encodeURIComponent(schoolId)}/departments/all`, token));
}

export async function fetchProgramsBySchool(schoolId, token) {
  if (!schoolId) {
    return [];
  }
  return normalizeCollection(await apiGet(`/programs/schools/${encodeURIComponent(schoolId)}`, token));
}

export async function fetchProgramsByDepartment(departmentId, token) {
  if (!departmentId) {
    return [];
  }
  return normalizeCollection(await apiGet(`/programs/departments/${encodeURIComponent(departmentId)}`, token));
}

export async function fetchCoursesBySchool(schoolId, token) {
  if (!schoolId) {
    return [];
  }
  return normalizeCollection(await apiGet(`/courses/schools/${encodeURIComponent(schoolId)}`, token));
}

export async function fetchCoursesByDepartment(departmentId, token) {
  if (!departmentId) {
    return [];
  }
  return normalizeCollection(await apiGet(`/courses/departments/${encodeURIComponent(departmentId)}`, token));
}

export async function fetchCoursesByProgram(programId, token) {
  if (!programId) {
    return [];
  }
  return normalizeCollection(await apiGet(`/courses/programs/${encodeURIComponent(programId)}`, token));
}

export async function fetchAllCourses(token) {
  return normalizeCollection(await apiGet("/courses/university/all", token));
}

export async function fetchAcademicYears(token) {
  return normalizeCollection(await apiGet("/academic-years/all", token));
}

export async function fetchSemestersByAcademicYear(academicYearId, token) {
  if (!academicYearId) {
    return [];
  }
  return normalizeCollection(await apiGet(`/academic-years/${encodeURIComponent(academicYearId)}/semesters`, token));
}

export async function fetchStudentByRegistrationNumber(registrationNumber, token) {
  const response = await apiGet(
    `/students/registration/details?registrationNumber=${encodeURIComponent(registrationNumber)}`,
    token
  );
  return unwrapEntity(response);
}

export async function fetchStudentExamStatusesForCourses(studentId, token) {
  if (!studentId) {
    return [];
  }
  return normalizeCollection(
    await apiGet(`/students/me/courses/${encodeURIComponent(studentId)}/exam-status`, token)
  );
}

export async function submitStudentGrade(payload, token) {
  return apiPut("/results/grade", payload, token);
}

export function normalizeSchool(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    schoolId: String(data.schoolId || data.id || ""),
    name: String(data.name || data.schoolName || ""),
    code: String(data.code || data.schoolCode || "")
  };
}

export function normalizeDepartment(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    departmentId: String(data.departmentId || data.id || ""),
    name: String(data.name || data.departmentName || ""),
    code: String(data.code || data.departmentCode || "")
  };
}

export function normalizeProgram(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    programId: String(data.programId || data.id || ""),
    name: String(data.name || data.programName || ""),
    code: String(data.code || data.programCode || "")
  };
}

export function normalizeCourse(item) {
  const data = item && typeof item === "object" ? item : {};
  const courseEntity =
    (data.course && typeof data.course === "object" ? data.course : null) ||
    (data.courseDto && typeof data.courseDto === "object" ? data.courseDto : null) ||
    null;

  return {
    courseId: String(data.courseId || data.id || courseEntity?.courseId || courseEntity?.id || ""),
    code: String(data.courseCode || data.code || courseEntity?.courseCode || courseEntity?.code || ""),
    title: String(data.courseTitle || data.title || data.name || courseEntity?.courseTitle || courseEntity?.title || "")
  };
}

export function normalizeAcademicYear(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    academicYearId: String(data.academicYearId || data.id || ""),
    name: String(data.name || data.academicYearName || ""),
    active: Boolean(data.active)
  };
}

export function normalizeSemester(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    semesterId: String(data.semesterId || data.id || ""),
    name: String(data.name || data.semesterName || ""),
    number: data.number ?? "",
    active: Boolean(data.active)
  };
}

export function normalizeStudent(item, fallbackRegistrationNumber = "") {
  const data = item && typeof item === "object" ? item : {};
  const firstName = String(data.firstName || "");
  const lastName = String(data.lastName || "");
  const fullName = `${firstName} ${lastName}`.trim();
  return {
    studentId: String(data.studentId || data.id || ""),
    registrationNumber: String(data.registrationNumber || fallbackRegistrationNumber || ""),
    studentName: fullName || String(data.studentName || data.fullName || ""),
    programName: String(data.programName || "")
  };
}

export function normalizeExamStatus(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    courseId: String(data.courseId || data.id || ""),
    examRegistered: Boolean(data.examRegistered)
  };
}

export function dedupeById(items, selectKey) {
  const seen = new Set();
  const list = [];

  (Array.isArray(items) ? items : []).forEach((item) => {
    const key = String(selectKey(item) || "");
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    list.push(item);
  });

  return list;
}

async function apiGet(path, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw await buildApiError(response, "Request failed");
  }

  return safeParseJson(response);
}

async function apiPost(path, payload, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Submit grade");
  }

  return safeParseJson(response);
}

async function apiPut(path, payload, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await buildApiError(response, "Submit grade");
  }

  return safeParseJson(response);
}

async function safeParseJson(response) {
  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

async function buildApiError(response, action) {
  let errorMessage = `${action} failed with status ${response.status}`;

  try {
    const errorBody = await response.json();
    errorMessage = errorBody?.message || errorBody?.error || errorMessage;
  } catch {
    // Keep fallback message.
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  return error;
}

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
    "schools",
    "departments",
    "programs",
    "courses",
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

  if (responseData.id || responseData.schoolId || responseData.courseId || responseData.semesterId) {
    return [responseData];
  }

  return [];
}

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
