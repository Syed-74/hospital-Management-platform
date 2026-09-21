import catchAsync from "../../utils/catchAsync.js";
import usersService from "./users.service.js";

export const getMe = (req, res, next) => {
  // req.user is set by auth.middleware.js
  const user = req.user;
  // Make sure not to send password back
  delete user.password;
  
  res.status(200).json({
    status: "success",
    data: { user },
  });
};

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await usersService.getAllUsers(req.user);
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

export const createUser = catchAsync(async (req, res, next) => {
  const user = await usersService.createUser(req.user, req.body);
  res.status(201).json({
    status: "success",
    data: { user },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await usersService.updateUser(req.user, req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const assignRoles = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { roleIds } = req.body; // Expecting an array of role UUIDs

  if (!Array.isArray(roleIds)) {
    return res.status(400).json({ status: "fail", message: "roleIds must be an array" });
  }

  const user = await usersService.assignRolesToUser(req.user, userId, roleIds);
  res.status(200).json({ status: "success", data: { user } });
});
