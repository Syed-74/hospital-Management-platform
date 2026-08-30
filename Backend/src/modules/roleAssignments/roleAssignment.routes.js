import express from "express";
import { createAssignment, getAssignments, revokeAssignment } from "./roleAssignment.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { USER_ASSIGN_ROLES } from "../auth/permissions.js";

const router = express.Router();

router.use(protect);
router.use(requirePermission(USER_ASSIGN_ROLES));

router.route("/")
  .post(createAssignment)
  .get(getAssignments);

router.delete("/:id", revokeAssignment);

export default router;
