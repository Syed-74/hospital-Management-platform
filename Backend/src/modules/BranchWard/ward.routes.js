import { Router } from "express";
import { 
    createBranchWard, 
    getAllBranchWards, 
    getBranchWardById, 
    updateBranchWard, 
    deleteBranchWard 
} from "./ward.controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = Router();

router.use(protect);

const PERMISSIONS_CREATE = ["wards:create", "branch:manage", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_READ = ["wards:read", "branch:read", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_UPDATE = ["wards:update", "branch:manage", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_DELETE = ["wards:delete", "branch:manage", "branch:access", "hospital:access", "platform:access"];

router.post("/create", requirePermission(PERMISSIONS_CREATE), createBranchWard);
router.post("/", requirePermission(PERMISSIONS_CREATE), createBranchWard);
router.get("/", requirePermission(PERMISSIONS_READ), getAllBranchWards);
router.get("/:id", requirePermission(PERMISSIONS_READ), getBranchWardById);
router.put("/:id", requirePermission(PERMISSIONS_UPDATE), updateBranchWard);
router.delete("/:id", requirePermission(PERMISSIONS_DELETE), deleteBranchWard);

export default router;