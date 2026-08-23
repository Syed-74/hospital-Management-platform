import { Router } from "express";
import { 
    createDepartmentType, 
    getDepartmentTypes, 
    getDepartmentTypeById, 
    updateDepartmentType, 
    deleteDepartmentType 
} from "./departmentType.controllers.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = Router();

// Protect all routes in this router
router.use(protect);

router.post("/create", requirePermission("departments:create"), createDepartmentType);
router.get("/", requirePermission("departments:read"), getDepartmentTypes);
router.get("/:id", requirePermission("departments:read"), getDepartmentTypeById);
router.put("/:id", requirePermission("departments:update"), updateDepartmentType);
router.delete("/:id", requirePermission("departments:delete"), deleteDepartmentType);

export default router;
