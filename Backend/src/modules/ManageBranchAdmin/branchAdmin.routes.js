import express from "express";
import {
    createBranchAdmin,
    getAllBranchAdmins,
    getBranchAdminById,
    updateBranchAdmin,
    deleteBranchAdmin
} from "./branchAdmin.controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { BRANCH_ADMIN_VIEW, BRANCH_ADMIN_MANAGE } from "../auth/permissions.js";
import { prisma } from "../../config/db.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Resolve the ACTUAL hospital + branch a given branch admin :id (Employee.id)
// belongs to from the database — never trust the id alone as proof of
// ownership.
const resolveBranchAdminScope = async (req) => {
    const admin = await prisma.employee.findFirst({
        where: { id: req.params.id, deletedAt: null },
        select: {
            hospitalId: true,
            assignments: { where: { isPrimary: true }, select: { branchId: true }, take: 1 },
        },
    });
    if (!admin) return null;
    return { hospitalId: admin.hospitalId, branchId: admin.assignments[0]?.branchId ?? null };
};

router.route("/")
    // Creation is validated + scoped inside the service (mirrors how a
    // hospital admin's own hospitalId always wins over client input there).
    .post(requirePermission(BRANCH_ADMIN_MANAGE), createBranchAdmin)
    .get(requirePermission(BRANCH_ADMIN_VIEW), getAllBranchAdmins);

router.route("/:id")
    .get(requirePermission(BRANCH_ADMIN_VIEW, { resolveScope: resolveBranchAdminScope }), getBranchAdminById)
    .put(requirePermission(BRANCH_ADMIN_MANAGE, { resolveScope: resolveBranchAdminScope }), updateBranchAdmin)
    .delete(requirePermission(BRANCH_ADMIN_MANAGE, { resolveScope: resolveBranchAdminScope }), deleteBranchAdmin);

export default router;
