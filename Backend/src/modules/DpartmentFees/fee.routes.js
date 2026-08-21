import express from "express";
import { createFee, getAllFees, getFeeById, updateFee, deleteFee } from "./fee.Controllers.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = express.Router();

// Protect all routes in this router
router.use(protect);

router.post("/", requirePermission("fees:create"), createFee);
router.get("/", requirePermission("fees:read"), getAllFees);
router.get("/:id", requirePermission("fees:read"), getFeeById);
router.put("/:id", requirePermission("fees:update"), updateFee);
router.delete("/:id", requirePermission("fees:delete"), deleteFee);

export default router;