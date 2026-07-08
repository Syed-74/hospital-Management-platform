import express from "express";
import { createPermission, getPermissions } from "./permissions.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
// Require 'permissions:manage' for all permission routes
router.use(requirePermission("permissions:manage"));

router.route("/")
  .post(createPermission)
  .get(getPermissions);

export default router;
