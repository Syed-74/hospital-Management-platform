import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class UsersService {
  /**
   * Hospital-bound callers only ever see their own hospital's users.
   * Only a platform-level caller (no hospitalId) sees across all tenants.
   */
  async getAllUsers(actingUser) {
    const where = {};
    if (actingUser?.hospitalId) {
      where.hospitalId = actingUser.hospitalId;
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        hospitalId: true,
        roleAssignments: {
          select: {
            hospitalId: true,
            branchId: true,
            role: {
              select: {
                id: true,
                name: true,
                scope: true,
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Grants GLOBAL-scope roles (e.g. PLATFORM_ADMIN) to a user. Scoped
   * (TENANT/BRANCH) grants must go through POST /role-assignments instead,
   * which validates hospital/branch ownership — this endpoint has no scope
   * inputs at all, so it can only ever hand out roles that don't need one.
   */
  async assignRolesToUser(actingUser, userId, roleIds) {
    if (actingUser?.hospitalId) {
      throw new AppError("Only Platform Admins can grant platform-wide roles.", 403);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } });
    if (roles.length !== roleIds.length) {
      throw new AppError("One or more roles not found", 404);
    }
    if (roles.some((r) => r.scope !== "GLOBAL")) {
      throw new AppError(
        "This endpoint only grants GLOBAL scope roles. Use POST /role-assignments for hospital/branch-scoped roles.",
        400
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRoleAssignment.deleteMany({ where: { userId, hospitalId: null, branchId: null } });
      if (roleIds.length > 0) {
        await tx.userRoleAssignment.createMany({
          data: roleIds.map((roleId) => ({ userId, roleId, assignedBy: actingUser.id })),
          skipDuplicates: true,
        });
      }
    });

    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        roleAssignments: { include: { role: true } },
      },
    });
  }
}

export default new UsersService();
