import express from "express";
import { getMe, getAllUsers, assignRoles } from "./users.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = express.Router();

// 1. Get current logged in user (Requires basic authentication)
router.get("/me", protect, getMe);

// 2. Admin routes (Requires specific permissions)
router.use(protect);

router.get("/", requirePermission("users:read"), getAllUsers);
router.post("/:userId/roles", requirePermission("users:assign_roles"), assignRoles);

export default router;
