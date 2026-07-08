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
  const users = await usersService.getAllUsers();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

export const assignRoles = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { roleIds } = req.body; // Expecting an array of role UUIDs

  if (!Array.isArray(roleIds)) {
    return res.status(400).json({ status: "fail", message: "roleIds must be an array" });
  }

  const user = await usersService.assignRolesToUser(userId, roleIds);
  res.status(200).json({ status: "success", data: { user } });
});
