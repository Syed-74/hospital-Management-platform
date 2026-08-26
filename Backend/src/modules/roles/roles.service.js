import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class RolesService {
  async createRole(data) {
    const { name, description, scope = 'TENANT', hospitalId = null, branchId = null } = data;

    const exists = await prisma.role.findFirst({ where: { name, hospitalId, branchId } });
    if (exists) {
      throw new AppError("Role already exists", 400);
    }

    return await prisma.role.create({
      data: { name, description, scope, hospitalId, branchId },
    });
  }

  async getAllRoles(scope, user, branchIdFilter) {
    let whereClause = {};
    if (scope) {
      whereClause.scope = scope;
    }

    if (branchIdFilter) {
      whereClause.branchId = branchIdFilter;
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
        roleDashboards: { include: { dashboard: true } },
      },
    });
  }

  async assignPermissionsToRole(roleId, permissionIds, dashboardId) {
    // Validate role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Use a transaction to ensure atomic replacement
    await prisma.$transaction(async (tx) => {
      // 1. Clear old dashboard mapping
      await tx.roleDashboard.deleteMany({ where: { roleId } });

      // 2. Set new dashboard if provided
      if (dashboardId) {
        await tx.roleDashboard.create({
          data: { roleId, dashboardId },
        });
      }

      // 3. Clear old permission mapping
      await tx.rolePermission.deleteMany({ where: { roleId } });

      // 4. Set new permissions
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
        roleDashboards: { include: { dashboard: true } },
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
