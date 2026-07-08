import express from "express";
import { createHospital, getAllHospitals, getHospitalById, updateHospital, deleteHospital } from "./hospital.Controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { uploadHospitalLogo } from "../../middlewares/upload.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route("/")
    .post(requirePermission("hospitals:create"), uploadHospitalLogo.single("logoFile"), createHospital)
    .get(requirePermission("hospitals:read"), getAllHospitals);

router.route("/:id")
    .get(requirePermission("hospitals:read"), getHospitalById)
    .put(requirePermission("hospitals:update"), uploadHospitalLogo.single("logoFile"), updateHospital)
    .delete(requirePermission("hospitals:delete"), deleteHospital);

export default router;