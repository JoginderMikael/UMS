/**
 * @fileoverview Higher-level controller managing role-based user context and session state.
 * This controller ensures users have appropriate access to dashboards and hydrates
 * user records with contextual data like the active academic year.
 * @module scripts/controllers/roleController
 */
import { fetchCurrentUser } from "../models/authModel.js";
import { fetchAllAcademicYears } from "../models/academicYearModel.js";
import { loadCurrentUser, loadToken, saveCurrentUser } from "../models/sessionModel.js";
import {
  bindCurrentUserProfile,
  openCurrentUserProfileModal,
  showActiveUserName
} from "../views/userView.js";

/**
 * Initializes the role controller and performs essential access control checks.
 * Verifies that the user has a valid token and the correct role for the current page.
 * Also initiates background synchronization of demographic and academic year data.
 * @param {string} expectedRole - The role required to access the current dashboard (e.g., 'ADMIN').
 * @returns {void} Redirects to login if validation fails.
 */
export function initRoleController(expectedRole) {
  const token = loadToken();
  const user = loadCurrentUser();
  if (!token || !user || user.role !== expectedRole) {
    window.location.href = "/login.html";
    return;
  }

  void hydrateSessionUserWithActiveAcademicYear(user, token);
  showActiveUserName(user);
  bindCurrentUserProfile(async () => {
    try {
      const currentUser = await fetchCurrentUser(token);
      const enrichedUser = await enrichUserWithActiveAcademicYear(currentUser, token);
      saveCurrentUser(enrichedUser);
      showActiveUserName(enrichedUser);
      openCurrentUserProfileModal(enrichedUser);
    } catch (error) {
      if (error && error.status === 401) {
        window.location.href = "/login.html";
        return;
      }

      console.error("Fetch current user profile failed:", error);
    }
  });
}

/**
 * Synchronizes the stored session user data with current academic year information.
 * Ensures the 'activeAcademicYear' metadata is up-to-date in persistent storage.
 * @param {object} user - The basic user profile from session storage.
 * @param {string} token - The active authentication token for API access.
 * @returns {Promise<void>} Resolves when the storage has been updated.
 */
async function hydrateSessionUserWithActiveAcademicYear(user, token) {
  try {
    const enrichedUser = await enrichUserWithActiveAcademicYear(user, token);
    saveCurrentUser(enrichedUser);
  } catch (error) {
    console.error("Hydrate session user with active academic year failed:", error);
  }
}

/**
 * Appends active academic year details to a raw user profile object.
 * Fetches relevant calendar data to enrich the user record with year IDs and names.
 * @param {object} user - The original user profile object.
 * @param {string} token - The security token used for verification.
 * @returns {Promise<object>} A new object containing combining user details and academic year data.
 */
async function enrichUserWithActiveAcademicYear(user, token) {
  const activeAcademicYear = await resolveActiveAcademicYear(token);
  if (!activeAcademicYear) {
    return user;
  }

  return {
    ...user,
    activeAcademicYearId: activeAcademicYear.academicYearId,
    activeAcademicYearName: activeAcademicYear.name,
    academicYearId: activeAcademicYear.academicYearId,
    academicYearName: activeAcademicYear.name
  };
}

/**
 * Determines the currently active academic year by querying the calendar API.
 * Iterates through available academic year records to find the one marked as 'active'.
 * @param {string} token - Authentication token for the request.
 * @returns {Promise<(object|null)>} The active year object if identified, otherwise null.
 */
async function resolveActiveAcademicYear(token) {
  const responseData = await fetchAllAcademicYears(token);
  const years = normalizeCollection(responseData).map((item) => {
    const data = item && typeof item === "object" ? item : {};
    return {
      academicYearId: String(data.academicYearId || data.id || ""),
      name: data.name || data.academicYearName || "",
      active: Boolean(data.active)
    };
  });

  if (years.length === 0) {
    return null;
  }

  return years.find((item) => item.active) || years[0];
}

/**
 * Utility function to normalize various JSON response structures returned by academic-year APIs.
 * It recursively searches through common data wrappers (like 'data', 'content', 'items') 
 * to extract the actual array of objects.
 * @param {*} responseData - The raw response data from an API call.
 * @returns {Array<object>} A flat array of relevant utility objects.
 */
function normalizeCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  const candidateKeys = ["data", "content", "items", "results", "academicYears"];
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

  if (responseData.academicYearId || responseData.id) {
    return [responseData];
  }

  return [];
}
