/**
 * @fileoverview Main entry point for the Administrative portal.
 * Bootstraps the admin application by initializing all specialized controllers,
 * setting up role-based access control, and handling the global logout lifecycle.
 * @module admin/admin
 */
import { initRoleController } from "../scripts/controllers/roleController.js";
import { initLogoutController } from "../scripts/controllers/logoutController.js";
import { initAdminController } from "./controllers/adminController.js";
import { initSchoolController } from "./controllers/schoolController.js";
import { initDepartmentController } from "./controllers/departmentController.js";
import { initProgramController } from "./controllers/programController.js";
import { initCourseController } from "./controllers/courseController.js";
import { initEnrollmentController } from "./controllers/enrollmentController.js";
import { initAcademicYearController } from "./controllers/academicYearController.js";
import { initDashboardController } from "./controllers/dashboardController.js";
import { initFeeController } from "./controllers/feeController.js";

initLogoutController();
initRoleController("ADMIN");
initAdminController();
initSchoolController();
initDepartmentController();
initProgramController();
initCourseController();
initEnrollmentController();
initAcademicYearController();
initFeeController();
initDashboardController();
