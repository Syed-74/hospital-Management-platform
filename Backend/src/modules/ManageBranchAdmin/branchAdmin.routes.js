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

// Optional: import permission constants if available
// import { BRANCH_ADMIN_CREATE, BRANCH_ADMIN_VIEW, BRANCH_ADMIN_UPDATE, BRANCH_ADMIN_DELETE } from "../auth/permissions.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route("/")
    // .post(requirePermission(BRANCH_ADMIN_CREATE), createBranchAdmin)
    // .get(requirePermission(BRANCH_ADMIN_VIEW), getAllBranchAdmins);
    .post(createBranchAdmin)
    .get(getAllBranchAdmins);

router.route("/:id")
    // .get(requirePermission(BRANCH_ADMIN_VIEW), getBranchAdminById)
    // .put(requirePermission(BRANCH_ADMIN_UPDATE), updateBranchAdmin)
    // .delete(requirePermission(BRANCH_ADMIN_DELETE), deleteBranchAdmin);
    .get(getBranchAdminById)
    .put(updateBranchAdmin)
    .delete(deleteBranchAdmin);

export default router;