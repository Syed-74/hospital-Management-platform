import { Router } from "express";
import { 
    createDepartment, 
    getDepartments, 
    getDepartmentById, 
    updateDepartment, 
    deleteDepartment 
} from "./department.controllers.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/rbac.middleware.js";

const router = Router();

// Protect all routes in this router
router.use(protect);

router.post("/create", requirePermission("departments:create"), createDepartment);
router.get("/", requirePermission("departments:read"), getDepartments);
router.get("/:id", requirePermission("departments:read"), getDepartmentById);
router.put("/:id", requirePermission("departments:update"), updateDepartment);
router.delete("/:id", requirePermission("departments:delete"), deleteDepartment);

export default router;