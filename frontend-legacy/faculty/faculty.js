/**
 * @fileoverview Frontend module bootstrap.
 * @module faculty/faculty
 */
import { initRoleController } from "../scripts/controllers/roleController.js";
import { initLogoutController } from "../scripts/controllers/logoutController.js";
import { initFacultyMenuView, initFacultyPanelNavigation } from "./controllers/navigationController.js";
import { initFacultyGradingController } from "./controllers/gradingController.js";

initFacultyMenuView();
initFacultyPanelNavigation();
initFacultyGradingController();
initLogoutController();
initRoleController("FACULTY");
