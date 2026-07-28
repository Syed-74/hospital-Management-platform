import express from "express";
import { 
    createHospitalAdmin, 
    getAllHospitalAdmins, 
    getHospitalAdminById, 
    updateHospitalAdmin, 
    deleteHospitalAdmin 
} from "./hospitalAdmin.controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { 
    HOSPITAL_ADMIN_CREATE, 
    HOSPITAL_ADMIN_VIEW, 
    HOSPITAL_ADMIN_UPDATE, 
    HOSPITAL_ADMIN_DELETE 
} from "../auth/permissions.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route("/")
    .post(requirePermission(HOSPITAL_ADMIN_CREATE), createHospitalAdmin)
    .get(requirePermission(HOSPITAL_ADMIN_VIEW), getAllHospitalAdmins);

router.route("/:id")
    .get(requirePermission(HOSPITAL_ADMIN_VIEW), getHospitalAdminById)
    .put(requirePermission(HOSPITAL_ADMIN_UPDATE), updateHospitalAdmin)
    .delete(requirePermission(HOSPITAL_ADMIN_DELETE), deleteHospitalAdmin);

export default router;
