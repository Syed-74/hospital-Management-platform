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
import { prisma } from "../../config/db.js";

const router = Router();

// Apply authentication shield to all branch routes
router.use(protect);

// Creating/listing branches "of hospital :hospitalId" is a hospital-wide
// action — only a grant covering the whole hospital (TENANT/GLOBAL) may
// pass, never a single-branch grant.
const resolveHospitalWideScope = async (req) => {
    const hospital = await prisma.hospital.findFirst({
        where: { id: req.params.hospitalId, isDeleted: false },
        select: { id: true },
    });
    if (!hospital) return null;
    return { hospitalId: hospital.id, branchId: null };
};

// Resolve the ACTUAL hospital + branch a given branch :id belongs to from
// the database — never trust the id alone as proof of ownership.
const resolveBranchScope = async (req) => {
    const branch = await prisma.branchManage.findUnique({
        where: { id: req.params.id },
        select: { id: true, hospitalId: true },
    });
    if (!branch) return null;
    return { hospitalId: branch.hospitalId, branchId: branch.id };
};

// Hospital-scoped endpoints
router.post("/hospital/:hospitalId", requirePermission(BRANCH_MANAGE, { resolveScope: resolveHospitalWideScope }), createBranch);
router.get("/hospital/:hospitalId", requirePermission(BRANCH_VIEW, { resolveScope: resolveHospitalWideScope }), getBranches);

// Single Branch endpoints
router.get("/:id", requirePermission(BRANCH_VIEW, { resolveScope: resolveBranchScope }), getBranchById);
router.patch("/:id", requirePermission(BRANCH_MANAGE, { resolveScope: resolveBranchScope }), updateBranch);
router.delete("/:id", requirePermission(BRANCH_MANAGE, { resolveScope: resolveBranchScope }), deleteBranch);

export default router;
