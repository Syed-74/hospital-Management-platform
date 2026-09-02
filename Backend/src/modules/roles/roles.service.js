import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class RolesService {
  /**
   * A Role is a reusable capability template — it is never tied to a
   * branch. Scope of use (which hospital/branch a grant applies to) is
   * decided later, per-user, via UserRoleAssignment. This is what lets a
   * single "Branch Admin" role be reused across every branch of a hospital
   * instead of being duplicated per branch.
   */
  async createRole(data) {
    const { name, description, scope = 'HOSPITAL', hospitalId = null } = data;

    if (!['GLOBAL', 'HOSPITAL', 'BRANCH'].includes(scope)) {
      throw new AppError("Invalid role scope.", 400);
    }
    if (scope === 'GLOBAL' && hospitalId) {
      throw new AppError("GLOBAL scope roles cannot belong to a hospital.", 400);
    }

    const exists = await prisma.role.findFirst({ where: { name, hospitalId } });
    if (exists) {
      throw new AppError("A role with this name already exists for this hospital.", 400);
    }

    return await prisma.role.create({
      data: { name, description, scope, hospitalId },
    });
  }

  async getAllRoles(scope, user) {
    let whereClause = {};
    if (scope) {
      whereClause.scope = scope;
    }

    // User scope
    if (user?.hospitalId) {
       // If the user belongs to a specific hospital (Hospital/Branch Admin), they only see their tenant's roles.
       whereClause.hospitalId = user.hospitalId;
    } else {
       // Platform Admin sees templates by default unless otherwise specified
       whereClause.hospitalId = null;
    }

    return await prisma.role.findMany({
      where: whereClause,
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    // Validate role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Use a transaction to ensure atomic replacement
    await prisma.$transaction(async (tx) => {

      // 1. Clear old permission mapping
      await tx.rolePermission.deleteMany({ where: { roleId } });

      // 2. Set new permissions
      if (permissionIds && permissionIds.length > 0) {
        // Here permissionIds is an array of action strings, e.g., ["branch:manage", "hospital:access"]
        const resolvedPermissionIds = [];
        for (const actionName of permissionIds) {
          // Upsert permission to avoid seeding
          let perm = await tx.permission.findUnique({ where: { action: actionName } });
          if (!perm) {
            perm = await tx.permission.create({ data: { action: actionName } });
          }
          resolvedPermissionIds.push(perm.id);
        }

        await tx.rolePermission.createMany({
          data: resolvedPermissionIds.map((pid) => ({ roleId, permissionId: pid })),
        });
      }
    });

    return await this.getRolePermissions(roleId);
  }

  async getRolePermissions(roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const allPermissions = await prisma.permission.findMany();

    return {
      role,
      allPermissions,
    };
  }
}

export default new RolesService();
