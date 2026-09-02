import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

const ASSIGNMENT_INCLUDE = {
  role: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  branch: { select: { id: true, branchName: true, branchCode: true } },
  hospital: { select: { id: true, hospitalName: true, hospitalCode: true } },
};

class RoleAssignmentService {
  /**
   * Grants `roleId` to `userId` at a specific scope. This is the ONLY way
   * a role's permissions become effective for a user — it's what lets one
   * reusable "Branch Admin" role be bound to many different branches (or
   * the same user bound to several branches) without ever duplicating the
   * Role itself.
   *
   * Every value that determines the resulting scope is re-derived and
   * cross-checked against the database here — `hospitalId`/`branchId` in
   * the request body are inputs to validate, never facts to trust.
   */
  async createAssignment(actingUser, { userId, roleId, hospitalId, branchId }) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppError("Role not found", 404);

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new AppError("User not found", 404);

    let resolvedHospitalId = null;
    let resolvedBranchId = null;

    if (role.scope === "GLOBAL") {
      resolvedHospitalId = null;
      resolvedBranchId = null;
    } else if (role.scope === "HOSPITAL") {
      resolvedHospitalId = role.hospitalId || hospitalId || null;
      resolvedBranchId = null;
      if (!resolvedHospitalId) {
        throw new AppError("hospitalId is required to assign a HOSPITAL scope role.", 400);
      }
    } else if (role.scope === "BRANCH") {
      resolvedHospitalId = role.hospitalId || hospitalId || null;
      resolvedBranchId = branchId || null;
      if (!resolvedHospitalId || !resolvedBranchId) {
        throw new AppError("hospitalId and branchId are both required to assign a BRANCH scope role.", 400);
      }
      const branch = await prisma.branchManage.findUnique({ where: { id: resolvedBranchId } });
      if (!branch) throw new AppError("Branch not found", 404);
      if (branch.hospitalId !== resolvedHospitalId) {
        throw new AppError("This branch does not belong to the specified hospital.", 400);
      }
    } else {
      throw new AppError("Unrecognized role scope.", 400);
    }

    // A HOSPITAL/BRANCH role is owned by exactly one hospital — the
    // assignment can never point somewhere else.
    if (role.hospitalId && role.hospitalId !== resolvedHospitalId) {
      throw new AppError("This role does not belong to the specified hospital.", 400);
    }

    // --- Can the ACTING user actually grant this? ---
    if (actingUser.hospitalId) {
      // Hospital-bound callers (Hospital Admin, or a delegated user holding
      // users:assign_roles) may only grant roles owned by their own
      // hospital, to users of their own hospital, scoped to their own
      // hospital. They can never hand out a GLOBAL role or reach into a
      // different tenant, regardless of what the request body claims.
      if (role.scope === "GLOBAL") {
        throw new AppError("You are not permitted to grant a platform-wide role.", 403);
      }
      if (resolvedHospitalId !== actingUser.hospitalId) {
        throw new AppError("You can only assign roles within your own hospital.", 403);
      }
      if (targetUser.hospitalId !== actingUser.hospitalId) {
        throw new AppError("You can only assign roles to users within your own hospital.", 403);
      }
    }
    // Platform-level callers (actingUser.hospitalId === null) may grant any
    // internally-consistent assignment — already validated above.

    const existing = await prisma.userRoleAssignment.findFirst({
      where: { userId, roleId, hospitalId: resolvedHospitalId, branchId: resolvedBranchId },
    });
    if (existing) {
      return await prisma.userRoleAssignment.findUnique({
        where: { id: existing.id },
        include: ASSIGNMENT_INCLUDE,
      });
    }

    return await prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId,
        hospitalId: resolvedHospitalId,
        branchId: resolvedBranchId,
        assignedBy: actingUser.id,
      },
      include: ASSIGNMENT_INCLUDE,
    });
  }

  async listAssignments(actingUser, { userId, branchId, hospitalId } = {}) {
    const where = {};
    if (userId) where.userId = userId;
    if (branchId) where.branchId = branchId;

    if (actingUser.hospitalId) {
      // Hospital-bound callers only ever see grants within their own hospital.
      where.hospitalId = actingUser.hospitalId;
    } else if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    return await prisma.userRoleAssignment.findMany({
      where,
      include: ASSIGNMENT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async revokeAssignment(actingUser, assignmentId) {
    const assignment = await prisma.userRoleAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new AppError("Assignment not found", 404);

    if (actingUser.hospitalId && assignment.hospitalId !== actingUser.hospitalId) {
      // 404, not 403 — don't confirm that a foreign-hospital assignment exists.
      throw new AppError("Assignment not found", 404);
    }

    await prisma.userRoleAssignment.delete({ where: { id: assignmentId } });
    return null;
  }
}

export default new RoleAssignmentService();
