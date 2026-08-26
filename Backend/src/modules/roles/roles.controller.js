import catchAsync from "../../utils/catchAsync.js";
import rolesService from "./roles.service.js";

export const createRole = catchAsync(async (req, res, next) => {
  const roleData = { ...req.body };
  // If the user belongs to a hospital, enforce that the new role belongs to the same hospital
  if (req.user && req.user.hospitalId) {
    roleData.hospitalId = req.user.hospitalId;
  }
  const role = await rolesService.createRole(roleData);
  res.status(201).json({ status: "success", data: { role } });
});

export const getRoles = catchAsync(async (req, res, next) => {
  const { scope, branchId } = req.query;
  const roles = await rolesService.getAllRoles(scope, req.user, branchId);
  res.status(200).json({ status: "success", data: { roles } });
});

export const assignPermissions = catchAsync(async (req, res, next) => {
  const { roleId } = req.params;
  const { permissionIds, dashboardId } = req.body; // Expecting an array of permission UUIDs

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ status: "fail", message: "permissionIds must be an array" });
  }

  const result = await rolesService.assignPermissionsToRole(roleId, permissionIds, dashboardId);
  res.status(200).json({ status: "success", data: result });
});

export const getRolePermissions = catchAsync(async (req, res, next) => {
  const { roleId } = req.params;
  const result = await rolesService.getRolePermissions(roleId);
  res.status(200).json({ status: "success", data: result });
});
