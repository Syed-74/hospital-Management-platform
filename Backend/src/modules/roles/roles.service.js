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

    // Connect permissions to the role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });

    return updatedRole;
  }
}

export default new RolesService();
