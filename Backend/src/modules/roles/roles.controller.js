import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import rolesService from "./roles.service.js";

export const createRole = catchAsync(async (req, res, next) => {
  const roleData = { ...req.body };
  // A Role is never branch-specific — strip any legacy/client-supplied
  // branchId. Branch scoping happens per-assignment (see role-assignments module).
  delete roleData.branchId;

  if (req.user?.hospitalId) {
    // Hospital-bound callers (Hospital Admin, or a delegated Branch Admin
    // holding roles:manage) can only create roles owned by their own
    // hospital, and can never mint a platform-wide GLOBAL role.
    if (roleData.scope === "GLOBAL") {
      return next(new AppError("Only Platform Admins can create GLOBAL scope roles.", 403));
    }
    roleData.hospitalId = req.user.hospitalId;
  } else {
    // Platform-level caller: Can create GLOBAL or TENANT templates.
    roleData.hospitalId = null;
    if (!roleData.scope) {
      roleData.scope = "GLOBAL";
    }
  }

  const role = await rolesService.createRole(roleData);
  res.status(201).json({ status: "success", data: { role } });
});

export const getRoles = catchAsync(async (req, res, next) => {
  const { scope } = req.query;
  const roles = await rolesService.getAllRoles(scope, req.user);
  res.status(200).json({ status: "success", data: { roles } });
});

export const assignPermissions = catchAsync(async (req, res, next) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body; // Expecting an array of permission UUIDs

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ status: "fail", message: "permissionIds must be an array" });
  }

  const result = await rolesService.assignPermissionsToRole(roleId, permissionIds);
  res.status(200).json({ status: "success", data: result });
});

export const getRolePermissions = catchAsync(async (req, res, next) => {
  const { roleId } = req.params;
  const result = await rolesService.getRolePermissions(roleId);
  res.status(200).json({ status: "success", data: result });
});
