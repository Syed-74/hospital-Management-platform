import { Router } from "express";
import { createHospitalTheme, getHospitalTheme, updateHospitalTheme } from "./hospitalTheme.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = Router();

// Apply auth middleware to all routes
router.use(protect);

router.post("/", requirePermission("themes:manage"), createHospitalTheme);
router.get("/:hospitalId", getHospitalTheme);
router.patch("/:hospitalId", requirePermission("themes:manage"), updateHospitalTheme);

export default router;
