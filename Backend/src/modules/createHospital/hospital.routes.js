import express from "express";
import { createHospital, getAllHospitals, getHospitalById, updateHospital, deleteHospital } from "./hospital.Controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { uploadHospitalLogo } from "../../middlewares/upload.middleware.js";
import { 
    HOSPITAL_CREATE, 
    HOSPITAL_VIEW, 
    HOSPITAL_UPDATE, 
    HOSPITAL_DELETE 
} from "../auth/permissions.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route("/")
    .post(requirePermission(HOSPITAL_CREATE), uploadHospitalLogo.single("logoFile"), createHospital)
    .get(requirePermission(HOSPITAL_VIEW), getAllHospitals);

router.route("/:id")
    .get(requirePermission(HOSPITAL_VIEW), getHospitalById)
    .put(requirePermission(HOSPITAL_UPDATE), uploadHospitalLogo.single("logoFile"), updateHospital)
    .delete(requirePermission(HOSPITAL_DELETE), deleteHospital);

export default router;