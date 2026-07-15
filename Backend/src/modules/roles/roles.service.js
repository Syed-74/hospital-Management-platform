import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class RolesService {
  async createRole(data) {
    const { name, description } = data;

    const exists = await prisma.role.findUnique({ where: { name } });
    if (exists) {
      throw new AppError("Role already exists", 400);
    }

    return await prisma.role.create({
      data: { name, description },
    });
  }

  async getAllRoles(scope) {
    const whereClause = scope ? { scope } : {};
    
    return await prisma.role.findMany({
      where: whereClause,
      include: {
        permissions: true,
      },
    });
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    // Validate role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Set (overwrite) permissions on the role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });

    return updatedRole;
  }

  async getRolePermissions(roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
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
