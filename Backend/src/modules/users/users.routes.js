import express from "express";
import { getMe, getAllUsers, createUser, updateUser, assignRoles } from "./users.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { USER_VIEW, USER_ASSIGN_ROLES, USER_MANAGE } from "../auth/permissions.js";

const router = express.Router();

// 1. Get current logged in user (Requires basic authentication)
router.get("/me", protect, getMe);

// 2. Admin routes (Requires specific permissions)
router.use(protect);

router.get("/", requirePermission(USER_VIEW), getAllUsers);
router.post("/", requirePermission(USER_MANAGE), createUser);
router.put("/:id", requirePermission(USER_MANAGE), updateUser);
router.patch("/:id", requirePermission(USER_MANAGE), updateUser);
router.post("/:userId/roles", requirePermission(USER_ASSIGN_ROLES), assignRoles);

export default router;
