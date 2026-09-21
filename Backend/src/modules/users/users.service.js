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
        dateOfBirth: true,
        gender: true,
        mobileNumber: true,
        profilePhoto: true,
        isActive: true,
        hospitalId: true,
        roleAssignments: {
          select: {
            id: true,
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

  async createUser(actingUser, userData) {
    const { email, password, firstName, lastName, dateOfBirth, gender, mobileNumber, phone, profilePhoto, roleId, branchId } = userData;
    const bcrypt = await import("bcrypt");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("A user with this email address already exists.", 400);
    }

    const hashedPassword = await bcrypt.default.hash(password || "Staff@123!", 10);
    const targetHospitalId = actingUser?.hospitalId || userData.hospitalId || null;

    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          mobileNumber: mobileNumber || phone || null,
          profilePhoto: profilePhoto || null,
          hospitalId: targetHospitalId,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
        },
      });

      await tx.userCredential.create({
        data: { userId: newUser.id, passwordHash: hashedPassword },
      });

      if (roleId) {
        await tx.userRoleAssignment.create({
          data: {
            userId: newUser.id,
            roleId,
            hospitalId: targetHospitalId,
            branchId: branchId || null,
            assignedBy: actingUser?.id || null,
          },
        });
      }

      return await tx.user.findUnique({
        where: { id: newUser.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          mobileNumber: true,
          profilePhoto: true,
          isActive: true,
          hospitalId: true,
          roleAssignments: { include: { role: true } },
        },
      });
    });
  }

  async updateUser(actingUser, userId, updateData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (actingUser?.hospitalId && user.hospitalId && user.hospitalId !== actingUser.hospitalId) {
      throw new AppError("Access denied", 403);
    }

    const dataToUpdate = {};
    if (updateData.firstName !== undefined) dataToUpdate.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) dataToUpdate.lastName = updateData.lastName;
    if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
    if (updateData.dateOfBirth !== undefined) dataToUpdate.dateOfBirth = updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null;
    if (updateData.gender !== undefined) dataToUpdate.gender = updateData.gender;
    if (updateData.mobileNumber !== undefined || updateData.phone !== undefined) {
      dataToUpdate.mobileNumber = updateData.mobileNumber || updateData.phone;
    }
    if (updateData.profilePhoto !== undefined) dataToUpdate.profilePhoto = updateData.profilePhoto;
    if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;

    return await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });

      if (updateData.password && updateData.password.trim() !== '') {
        const bcrypt = await import("bcrypt");
        const passwordHash = await bcrypt.default.hash(updateData.password, 10);
        await tx.userCredential.upsert({
          where: { userId },
          update: { passwordHash },
          create: { userId, passwordHash },
        });
      }

      if (updateData.roleId) {
        await tx.userRoleAssignment.deleteMany({ where: { userId } });
        await tx.userRoleAssignment.create({
          data: {
            userId,
            roleId: updateData.roleId,
            hospitalId: user.hospitalId,
            branchId: updateData.branchId || null,
            assignedBy: actingUser?.id || null,
          },
        });
      }

      return await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          mobileNumber: true,
          profilePhoto: true,
          isActive: true,
          hospitalId: true,
          roleAssignments: { include: { role: true } },
        },
      });
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
