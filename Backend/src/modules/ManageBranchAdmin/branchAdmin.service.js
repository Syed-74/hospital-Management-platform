import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";

export default class BranchAdminService {
    static async createBranchAdmin(adminData) {
        // Unpack data
        const {
            email,
            password,
            firstName,
            lastName,
            middleName,
            hospitalId,
            branchId,
            employeeId,
            phoneNumber,
            phone,
            roleId,
            ...rest
        } = adminData;

        // 1. Verify hospital and branch exist
        const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
        if (!hospital) throw new AppError("Hospital not found", 404);

        const branch = await prisma.branchManage.findUnique({ where: { id: branchId } });
        if (!branch) throw new AppError("Branch not found", 404);

        // 2. Check for unique constraints (email, employeeId)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new AppError("Email is already registered", 409);

        if (employeeId) {
            const existingEmployee = await prisma.branchAdmin.findUnique({ where: { employeeId } });
            if (existingEmployee) throw new AppError("Employee ID already exists", 409);
        }

        // 3. Hash password (or create a default one)
        const rawPassword = password || "BranchAdmin@123!";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // Prepare branch admin data
        const branchAdminData = {
            ...rest,
            userId: "", // Will be set after user creation
            hospitalId,
            branchId,
            email,
            firstName,
            lastName,
            middleName,
            employeeId,
            phoneNumber: phoneNumber || phone,
            fullName: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`,
        };

        if (roleId && roleId.trim() !== "") {
            branchAdminData.roleId = roleId;
        }

        // Parse Date fields into ISO-8601 strings for Prisma
        if (adminData.dateOfBirth) branchAdminData.dateOfBirth = new Date(adminData.dateOfBirth).toISOString();
        if (adminData.joiningDate) branchAdminData.joiningDate = new Date(adminData.joiningDate).toISOString();
        if (adminData.relievingDate) branchAdminData.relievingDate = new Date(adminData.relievingDate).toISOString();
        
        // Parse booleans
        if (adminData.twoFactorEnabled !== undefined) branchAdminData.twoFactorEnabled = adminData.twoFactorEnabled === true || adminData.twoFactorEnabled === "true";

        // 4. Create User and BranchAdmin in a transaction
        return await prisma.$transaction(async (tx) => {
            const userData = {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                hospitalId,
            };

            // Connect the assigned role to the User model for RBAC
            if (roleId && roleId.trim() !== "") {
                userData.roles = {
                    connect: [{ id: roleId }]
                };
            }

            const newUser = await tx.user.create({
                data: userData
            });

            branchAdminData.userId = newUser.id;

            const newBranchAdmin = await tx.branchAdmin.create({
                data: branchAdminData
            });

            return newBranchAdmin;
        });
    }

    static async getAllBranchAdmins(hospitalId) {
        const whereClause = hospitalId ? { hospitalId, deletedAt: null } : { deletedAt: null };
        return await prisma.branchAdmin.findMany({
            where: whereClause,
            include: {
                user: { select: { email: true, isActive: true } },
                branch: { select: { branchName: true, branchCode: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getBranchAdminById(id) {
        const admin = await prisma.branchAdmin.findFirst({
            where: { id, deletedAt: null },
            include: {
                user: { select: { email: true, isActive: true } },
                branch: { select: { branchName: true, branchCode: true } },
                hospital: { select: { hospitalName: true } }
            }
        });
        if (!admin) throw new AppError("Branch Admin not found", 404);
        return admin;
    }

    static async updateBranchAdmin(id, updateData) {
        const admin = await prisma.branchAdmin.findUnique({ where: { id } });
        if (!admin) throw new AppError("Branch Admin not found", 404);

        // Prevent updating critical relational or auth fields directly here
        const { email, password, userId, hospitalId, branchId, phone, roleId, ...safeData } = updateData;

        // Map phone to phoneNumber if provided
        if (phone) {
            safeData.phoneNumber = phone;
        }

        // Ignore empty roleId
        if (roleId && roleId.trim() !== "") {
            safeData.roleId = roleId;
        }

        // Allow branch reassignment
        if (branchId) {
            safeData.branchId = branchId;
        }

        // Parse Date fields into ISO-8601 strings for Prisma
        if (updateData.dateOfBirth) safeData.dateOfBirth = new Date(updateData.dateOfBirth).toISOString();
        if (updateData.joiningDate) safeData.joiningDate = new Date(updateData.joiningDate).toISOString();
        if (updateData.relievingDate) safeData.relievingDate = new Date(updateData.relievingDate).toISOString();
        
        // Parse booleans
        if (updateData.twoFactorEnabled !== undefined) safeData.twoFactorEnabled = updateData.twoFactorEnabled === true || updateData.twoFactorEnabled === "true";

        return await prisma.$transaction(async (tx) => {
            // Cascade update to User table
            if (email || password || safeData.firstName || safeData.lastName || (roleId && roleId.trim() !== "")) {
                const userUpdate = {};
                if (email) userUpdate.email = email;
                if (safeData.firstName) userUpdate.firstName = safeData.firstName;
                if (safeData.lastName) userUpdate.lastName = safeData.lastName;

                if (password) {
                    const salt = await bcrypt.genSalt(10);
                    userUpdate.password = await bcrypt.hash(password, salt);
                }

                // Sync the assigned role to the User model for RBAC
                if (roleId && roleId.trim() !== "") {
                    userUpdate.roles = {
                        set: [{ id: roleId }] // Replaces existing roles with the new one
                    };
                }

                if (Object.keys(userUpdate).length > 0) {
                    await tx.user.update({
                        where: { id: admin.userId },
                        data: userUpdate
                    });
                }
            }

            if (email) safeData.email = email;

            return await tx.branchAdmin.update({
                where: { id },
                data: safeData
            });
        });
    }

    static async deleteBranchAdmin(id) {
        const admin = await prisma.branchAdmin.findUnique({ where: { id } });
        if (!admin) throw new AppError("Branch Admin not found", 404);

        // Hard delete the branch admin and the user from the database
        return await prisma.$transaction(async (tx) => {
            const deletedBranchAdmin = await tx.branchAdmin.delete({
                where: { id }
            });

            await tx.user.delete({
                where: { id: admin.userId }
            });

            return deletedBranchAdmin;
        });
    }
}
