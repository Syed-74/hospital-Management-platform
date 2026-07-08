import express from "express";
import { 
    createHospitalAdmin, 
    getAllHospitalAdmins, 
    getHospitalAdminById, 
    updateHospitalAdmin, 
    deleteHospitalAdmin 
} from "./HospitalAdmin.controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route("/")
    .post(requirePermission("hospitalAdmins:create"), createHospitalAdmin)
    .get(requirePermission("hospitalAdmins:read"), getAllHospitalAdmins);

router.route("/:id")
    .get(requirePermission("hospitalAdmins:read"), getHospitalAdminById)
    .put(requirePermission("hospitalAdmins:update"), updateHospitalAdmin)
    .delete(requirePermission("hospitalAdmins:delete"), deleteHospitalAdmin);

export default router;
