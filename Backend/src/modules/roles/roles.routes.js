import express from "express";
import { createRole, getRoles, assignPermissions, getRolePermissions } from "./roles.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = express.Router();

router.use(protect);
router.use(requirePermission("roles:manage"));

router.route("/")
  .post(createRole)
  .get(getRoles);

router.route("/:roleId/permissions")
  .get(getRolePermissions)
  .post(assignPermissions);

export default router;
