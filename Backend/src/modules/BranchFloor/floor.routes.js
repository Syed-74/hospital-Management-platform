import { Router } from "express";
import { 
    createBranchFloor, 
    getAllBranchFloors, 
    getBranchFloorById, 
    updateBranchFloor, 
    deleteBranchFloor 
} from "./floor.controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = Router();

router.use(protect);

const PERMISSIONS_CREATE = ["floors:create", "branch:manage", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_READ = ["floors:read", "branch:read", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_UPDATE = ["floors:update", "branch:manage", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_DELETE = ["floors:delete", "branch:manage", "branch:access", "hospital:access", "platform:access"];

router.post("/create", requirePermission(PERMISSIONS_CREATE), createBranchFloor);
router.post("/", requirePermission(PERMISSIONS_CREATE), createBranchFloor);
router.get("/", requirePermission(PERMISSIONS_READ), getAllBranchFloors);
router.get("/:id", requirePermission(PERMISSIONS_READ), getBranchFloorById);
router.put("/:id", requirePermission(PERMISSIONS_UPDATE), updateBranchFloor);
router.delete("/:id", requirePermission(PERMISSIONS_DELETE), deleteBranchFloor);

export default router;
