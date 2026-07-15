import catchAsync from "../../utils/catchAsync.js";
import rolesService from "./roles.service.js";

export const createRole = catchAsync(async (req, res, next) => {
  const role = await rolesService.createRole(req.body);
  res.status(201).json({ status: "success", data: { role } });
});

export const getRoles = catchAsync(async (req, res, next) => {
  const { scope } = req.query;
  const roles = await rolesService.getAllRoles(scope);
  res.status(200).json({ status: "success", data: { roles } });
});

export const assignPermissions = catchAsync(async (req, res, next) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body; // Expecting an array of permission UUIDs

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ status: "fail", message: "permissionIds must be an array" });
  }

  const role = await rolesService.assignPermissionsToRole(roleId, permissionIds);
  res.status(200).json({ status: "success", data: { role } });
});

export const getRolePermissions = catchAsync(async (req, res, next) => {
  const { roleId } = req.params;
  const result = await rolesService.getRolePermissions(roleId);
  res.status(200).json({ status: "success", data: result });
});
