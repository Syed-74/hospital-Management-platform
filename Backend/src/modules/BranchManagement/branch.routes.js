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

const router = Router();

// Apply authentication shield to all branch routes
router.use(protect);

// Hospital-scoped endpoints
router.post("/hospital/:hospitalId", requirePermission("branch:manage"), createBranch);
router.get("/hospital/:hospitalId", requirePermission("branch:read"), getBranches);

// Single Branch endpoints
router.get("/:id", requirePermission("branch:read"), getBranchById);
router.patch("/:id", requirePermission("branch:manage"), updateBranch);
router.delete("/:id", requirePermission("branch:manage"), deleteBranch);

export default router;
