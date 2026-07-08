import catchAsync from "../../utils/catchAsync.js";
import permissionsService from "./permissions.service.js";

export const createPermission = catchAsync(async (req, res, next) => {
  const permission = await permissionsService.createPermission(req.body);
  res.status(201).json({ status: "success", data: { permission } });
});

export const getPermissions = catchAsync(async (req, res, next) => {
  const permissions = await permissionsService.getAllPermissions();
  res.status(200).json({ status: "success", data: { permissions } });
});
