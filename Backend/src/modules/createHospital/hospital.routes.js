import express from "express";
import { createHospital, getAllHospitals, getHospitalById, updateHospital, deleteHospital } from "./hospital.Controllers.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";
import { uploadHospitalLogo } from "../../middlewares/upload.middleware.js";
import { prisma } from "../../config/db.js";
import {
    HOSPITAL_CREATE,
    HOSPITAL_VIEW,
    HOSPITAL_UPDATE,
    HOSPITAL_DELETE
} from "../auth/permissions.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Creating a hospital and listing every hospital are inherently
// platform-wide operations — there is no existing hospital to scope them
// to, so only a GLOBAL (Platform Admin) grant may pass here.
const platformWideScope = async () => ({ hospitalId: null, branchId: null });

// Resolve the ACTUAL owning hospital of the :id in the URL from the
// database — never trust the id itself as proof of ownership.
const resolveHospitalScope = async (req) => {
    const hospital = await prisma.hospital.findFirst({
        where: { id: req.params.id, isDeleted: false },
        select: { id: true },
    });
    if (!hospital) return null;
    return { hospitalId: hospital.id, branchId: null };
};

router.route("/")
    .post(requirePermission(HOSPITAL_CREATE, { resolveScope: platformWideScope }), uploadHospitalLogo.single("logoFile"), createHospital)
    .get(requirePermission(HOSPITAL_VIEW, { resolveScope: platformWideScope }), getAllHospitals);

router.route("/:id")
    .get(requirePermission(HOSPITAL_VIEW, { resolveScope: resolveHospitalScope }), getHospitalById)
    .put(requirePermission(HOSPITAL_UPDATE, { resolveScope: resolveHospitalScope }), uploadHospitalLogo.single("logoFile"), updateHospital)
    .delete(requirePermission(HOSPITAL_DELETE, { resolveScope: resolveHospitalScope }), deleteHospital);

export default router;
