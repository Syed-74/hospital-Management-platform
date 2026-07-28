import { Router } from "express";
import { createHospitalTheme, getHospitalTheme, updateHospitalTheme } from "./hospitalTheme.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { THEME_MANAGE } from "../auth/permissions.js";

const router = Router();

// Apply auth middleware to all routes
router.use(protect);

router.post("/", requirePermission(THEME_MANAGE), createHospitalTheme);
router.get("/:hospitalId", getHospitalTheme);
router.patch("/:hospitalId", requirePermission(THEME_MANAGE), updateHospitalTheme);

export default router;
