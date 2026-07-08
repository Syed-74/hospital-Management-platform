import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class PermissionsService {
  async createPermission(data) {
    const { action, description } = data;

    const exists = await prisma.permission.findUnique({ where: { action } });
    if (exists) {
      throw new AppError("Permission already exists", 400);
    }

    return await prisma.permission.create({
      data: { action, description },
    });
  }

  async getAllPermissions() {
    return await prisma.permission.findMany();
  }
}

export default new PermissionsService();
