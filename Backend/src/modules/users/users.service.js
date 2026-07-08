import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class UsersService {
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async assignRolesToUser(userId, roleIds) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: [], // Clear existing roles if you want to fully replace them, or use connect to just add.
          connect: roleIds.map((id) => ({ id })),
        },
      },
      select: {
        id: true,
        email: true,
        roles: true,
      },
    });

    return updatedUser;
  }
}

export default new UsersService();
