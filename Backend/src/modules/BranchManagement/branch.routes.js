import { Router } from "express";
import { 
    createBranch, 
    getBranches, 
    getBranchById, 
    updateBranch, 
    deleteBranch 
} from "./branch.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { BRANCH_MANAGE, BRANCH_VIEW } from "../auth/permissions.js";

const router = Router();

// Apply authentication shield to all branch routes
router.use(protect);

// Hospital-scoped endpoints
router.post("/hospital/:hospitalId", requirePermission(BRANCH_MANAGE), createBranch);
router.get("/hospital/:hospitalId", requirePermission(BRANCH_VIEW), getBranches);

// Single Branch endpoints
router.get("/:id", requirePermission(BRANCH_VIEW), getBranchById);
router.patch("/:id", requirePermission(BRANCH_MANAGE), updateBranch);
router.delete("/:id", requirePermission(BRANCH_MANAGE), deleteBranch);

export default router;
