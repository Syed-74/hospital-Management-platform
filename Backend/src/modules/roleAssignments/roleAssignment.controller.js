import catchAsync from "../../utils/catchAsync.js";
import roleAssignmentService from "./roleAssignment.service.js";

/**
 * POST /api/v1/role-assignments
 * Grants an existing (reusable) role to a user at a given hospital/branch
 * scope. This is how you make someone "Branch Admin for Branch A" — you
 * never create a new Role for that, you create an assignment.
 */
export const createAssignment = catchAsync(async (req, res, next) => {
  const assignment = await roleAssignmentService.createAssignment(req.user, req.body);
  res.status(201).json({ status: "success", data: { assignment } });
});

export const getAssignments = catchAsync(async (req, res, next) => {
  const assignments = await roleAssignmentService.listAssignments(req.user, req.query);
  res.status(200).json({ status: "success", results: assignments.length, data: { assignments } });
});

export const revokeAssignment = catchAsync(async (req, res, next) => {
  await roleAssignmentService.revokeAssignment(req.user, req.params.id);
  res.status(200).json({ status: "success", data: null });
});
