/**
 * @fileoverview Administrative Dashboard controller.
 * Aggregates and displays system-wide statistics, including counts for schools, departments,
 * courses, programs, and users. Provides quick-access navigation for common admin tasks.
 * @module admin/controllers/dashboardController
 */
import { loadToken } from "../../scripts/models/sessionModel.js";
import { fetchAllSchools } from "../models/schoolModel.js";
import { fetchAllDepartmentsBySchool } from "../models/departmentModel.js";
import { fetchAllUniversityCourses } from "../models/courseModel.js";
import { fetchAllProgramsMinimal } from "../models/programModel.js";
import { fetchAllUsers } from "../models/userModel.js";
import { fetchAllAcademicYears, fetchSemestersByAcademicYear } from "../models/academicYearModel.js";
import {
  bindAdminHomeTriggers,
  bindDashboardActions,
  renderAdminHome,
  setDashboardMessage
} from "../views/dashboardView.js";

const QUICK_LINK_GROUPS = [
  {
    key: "top",
    links: [
      { label: "Enroll Students", target: ".js-enroll-student" },
      { label: "View Programs", target: ".js-view-all-programs" },
      { label: "View Courses", target: ".js-view-all-courses" }
    ]
  },
  {
    key: "structure",
    links: [
      { label: "View Schools", target: ".js-view-all-schools" },
      { label: "View Departments", target: ".js-view-all-departments" },
      { label: "View Programs", target: ".js-view-all-programs" },
      { label: "View Courses", target: ".js-view-all-courses" }
    ]
  },
  {
    key: "people",
    links: [
      { label: "View Users", target: ".js-view-all-users" },
      { label: "Create User", target: ".js-create-user" },
      { label: "Enroll Students", target: ".js-enroll-student" },
      { label: "Fee Payments", target: ".js-view-fee-payments" }
    ]
  },
  {
    key: "cycle",
    links: [
      { label: "Academic Year", target: ".js-academic-year-functions" },
      { label: "Semesters", target: ".js-semester-functions" },
      { label: "Enrollment Details", target: ".js-enrollment-details" },
      { label: "Configure Program Fee", target: ".js-configure-program-fee" }
    ]
  }
];

/**
 * Initializes the dashboard by binding the home refresh trigger and workspace navigation logic.
 * Triggers the first load of the administrative summary.
 * @returns {void} No return value.
 */
export function initDashboardController() {
  bindAdminHomeTriggers(openAdminHome);
  bindWorkspaceNavigationHiding();
  openAdminHome();
}

/**
 * Orchestrates the full assembly of the administrative dashboard view.
 * Fetches data across all major entities in parallel to calculate and render system statistics.
 * @returns {Promise<void>} Resolves when the summary has been calculated and rendered.
 */
async function openAdminHome() {
  renderAdminHome({
    stats: {},
    quickLinkGroups: QUICK_LINK_GROUPS,
    generatedAt: formatTimestamp(new Date())
  });
  setDashboardMessage("Loading university summary...");
  bindDashboardActions({
    onRefresh: openAdminHome,
    onQuickLink: openQuickLink
  });

  const token = loadToken();
  if (!token) {
    setDashboardMessage("Session expired. Please log in again.", "error");
    return;
  }

  try {
    const [
      schoolsResponse,
      coursesResponse,
      programsResponse,
      usersResponse,
      academicYearsResponse
    ] = await Promise.all([
      fetchAllSchools(token),
      fetchAllUniversityCourses(token),
      fetchAllProgramsMinimal(token),
      fetchAllUsers(token),
      fetchAllAcademicYears(token)
    ]);

    const schools = normalizeCollection(schoolsResponse);
    const courses = normalizeCollection(coursesResponse);
    const programs = normalizeCollection(programsResponse);
    const users = normalizeCollection(usersResponse);
    const academicYears = normalizeCollection(academicYearsResponse).map(normalizeAcademicYear);

    const departments = await loadAllDepartments(schools, token);
    const activeAcademicYear = academicYears.find((item) => item.active) || null;
    const activeSemester = await loadActiveSemester(academicYears, activeAcademicYear, token);

    const stats = {
      totalSchools: schools.length,
      totalDepartments: departments.length,
      totalCourses: courses.length,
      totalPrograms: programs.length,
      totalStudents: countUsersByRole(users, "STUDENT"),
      totalAdmins: countUsersByRole(users, "ADMIN"),
      totalFaculty: countUsersByRole(users, "FACULTY"),
      activeAcademicYear: activeAcademicYear?.name || "N/A",
      activeSemester: activeSemester?.name || "N/A"
    };

    renderAdminHome({
      stats,
      quickLinkGroups: QUICK_LINK_GROUPS,
      generatedAt: formatTimestamp(new Date())
    });
    bindDashboardActions({
      onRefresh: openAdminHome,
      onQuickLink: openQuickLink
    });
    setDashboardMessage("Summary loaded.", "success");
  } catch (error) {
    renderAdminHome({
      stats: {},
      quickLinkGroups: QUICK_LINK_GROUPS,
      generatedAt: formatTimestamp(new Date())
    });
    bindDashboardActions({
      onRefresh: openAdminHome,
      onQuickLink: openQuickLink
    });
    setDashboardMessage(error.message || "Failed to load dashboard summary.", "error");
  }
}

/**
 * Resolves a quick-link action by programmatically clicking the corresponding UI element.
 * Ensures the dashboard 'hero' section is hidden to show the targeted functional view.
 * @param {string} targetSelector - CSS selector for the UI element to be triggered.
 * @returns {void} No return value.
 */
function openQuickLink(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!(target instanceof HTMLElement)) {
    setDashboardMessage("Selected quick link is not available.", "error");
    return;
  }
  setHeroVisible(false);
  target.click();
}

/**
 * Established a global listener to manage the visibility of the dashboard hero section.
 * Automatically hides the hero when the user interacts with module links or quick links.
 * @returns {void} No return value.
 */
function bindWorkspaceNavigationHiding() {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const sidebarFunctionLink = target.closest(".module-links a");
      const dashboardQuickLink = target.closest(".js-dashboard-link");
      if (sidebarFunctionLink || dashboardQuickLink) {
        setHeroVisible(false);
      }
    },
    true
  );
}

/**
 * Aggregates the complete list of departments across every school in the university.
 * Performs a series of school-specific requests to build the comprehensive collection.
 * @param {Array<object>} schools - The list of schools to iterate over.
 * @param {string} token - Security token for API authentication.
 * @returns {Promise<Array<object>>} A promise resolving to a flat array of all departments.
 */
async function loadAllDepartments(schools, token) {
  const schoolIds = schools
    .map((school) => String(school.id || school.schoolId || ""))
    .filter((id) => id);
  if (schoolIds.length === 0) {
    return [];
  }

  const departmentLists = await Promise.all(
    schoolIds.map(async (schoolId) => {
      try {
        const response = await fetchAllDepartmentsBySchool(schoolId, token);
        return normalizeCollection(response);
      } catch {
        return [];
      }
    })
  );

  return departmentLists.flat();
}

/**
 * Identifies the currently active semester across the system.
 * Scans the active academic year first, then falls back to other years if necessary.
 * @param {Array<object>} academicYears - The list of all academic years.
 * @param {object|null} activeAcademicYear - The currently designated active year.
 * @param {string} token - Security token for authorization.
 * @returns {Promise<object|null>} The active semester object, or null if none is active.
 */
async function loadActiveSemester(academicYears, activeAcademicYear, token) {
  if (activeAcademicYear?.academicYearId) {
    try {
      const response = await fetchSemestersByAcademicYear(activeAcademicYear.academicYearId, token);
      const semesters = normalizeCollection(response).map(normalizeSemester);
      const active = semesters.find((item) => item.active);
      if (active) {
        return active;
      }
    } catch {
      // Continue to fallback scan.
    }
  }

  for (const year of academicYears) {
    if (!year.academicYearId) {
      continue;
    }
    try {
      const response = await fetchSemestersByAcademicYear(year.academicYearId, token);
      const semesters = normalizeCollection(response).map(normalizeSemester);
      const active = semesters.find((item) => item.active);
      if (active) {
        return active;
      }
    } catch {
      // Ignore one year failure and continue.
    }
  }

  return null;
}

/**
 * Utility helper to filter and count user records by their assigned security role.
 * @param {Array<object>} users - The collection of users to search.
 * @param {string} role - The target role string (e.g., 'STUDENT', 'ADMIN').
 * @returns {number} The count of matching users.
 */
function countUsersByRole(users, role) {
  return users.filter((user) => String(user.role || "").toUpperCase() === role).length;
}

/**
 * Normalizes normalize academic year.
 * @param {*} item
 * @returns {*}
 */
function normalizeAcademicYear(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    academicYearId: String(data.academicYearId || data.id || ""),
    name: data.name || "",
    active: Boolean(data.active)
  };
}

/**
 * Normalizes normalize semester.
 * @param {*} item
 * @returns {*}
 */
function normalizeSemester(item) {
  const data = item && typeof item === "object" ? item : {};
  return {
    semesterId: String(data.semesterId || data.id || ""),
    name: data.name || "",
    number: data.number ?? "",
    active: Boolean(data.active)
  };
}

/**
 * Broadly normalizes API responses into a predictable flat array of entities.
 * Navigates through a wide variety of candidate wrapper keys used across different endpoints.
 * @param {*} responseData - The raw response from a university API endpoint.
 * @returns {Array<object>} A guaranteed list of relevant data items.
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
    "content",
    "items",
    "results",
    "users",
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

  return [];
}

/**
 * Formats a Date object into a human-readable localized string for the dashboard header.
 * @param {Date} date - The date to be formatted.
 * @returns {string} A formatted string representing the dashboard generation time.
 */
function formatTimestamp(date) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

/**
 * Manages the visual visibility of the dashboard's hero/summary section.
 * @param {boolean} isVisible - Whether the hero section should be shown or hidden.
 * @returns {void} No return value.
 */
function setHeroVisible(isVisible) {
  const heroSection = document.querySelector(".hero");
  if (!heroSection) {
    return;
  }
  heroSection.hidden = !isVisible;
}
