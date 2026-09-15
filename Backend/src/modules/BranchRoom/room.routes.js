import { Router } from "express";
import {
    createBranchRoom,
    getAllBranchRooms,
    getBranchRoomById,
    updateBranchRoom,
    deleteBranchRoom
} from "./room.controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = Router();

router.use(protect);

const PERMISSIONS_CREATE = ["rooms:create", "branch:manage", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_READ = ["rooms:read", "branch:read", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_UPDATE = ["rooms:update", "branch:manage", "branch:access", "hospital:access", "platform:access"];
const PERMISSIONS_DELETE = ["rooms:delete", "branch:manage", "branch:access", "hospital:access", "platform:access"];

router.post("/create", requirePermission(PERMISSIONS_CREATE), createBranchRoom);
router.post("/", requirePermission(PERMISSIONS_CREATE), createBranchRoom);
router.get("/", requirePermission(PERMISSIONS_READ), getAllBranchRooms);
router.get("/:id", requirePermission(PERMISSIONS_READ), getBranchRoomById);
router.put("/:id", requirePermission(PERMISSIONS_UPDATE), updateBranchRoom);
router.delete("/:id", requirePermission(PERMISSIONS_DELETE), deleteBranchRoom);

export default router;
