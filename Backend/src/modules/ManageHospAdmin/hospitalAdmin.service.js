import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";

class HospitalAdminService {
    async createHospitalAdmin(data) {
        const { hospitalId, firstName, lastName, email, password, phone, employeeCode, roleId } = data;

        if (!password) {
            throw new AppError("Password is required", 400);
        }
        if (!roleId) {
            throw new AppError("Role ID is required", 400);
        }

        // Verify hospital exists
        const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId, isDeleted: false } });
        if (!hospital) {
            throw new AppError("Hospital not found", 404);
        }

        // Check if email exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError("Email is already in use", 400);
        }

        // Verify role exists
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new AppError("Role not found", 404);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        try {
            // Prisma Transaction for atomic creation
            const result = await prisma.$transaction(async (tx) => {
                // 1. Create User
                const user = await tx.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        hospitalId,
                        roles: {
                            connect: { id: role.id }
                        }
                    }
                });

                // 2. Create Profile
                const hospitalAdmin = await tx.hospitalAdmin.create({
                    data: {
                        userId: user.id,
                        employeeCode,
                        phone
                    }
                });

                return { user, hospitalAdmin };
            });

            // Omit password from response
            const { password: _, ...userWithoutPassword } = result.user;
            return { ...userWithoutPassword, hospitalAdmin: result.hospitalAdmin };
        } catch (error) {
            if (error.code === 'P2002') {
                const target = error.meta?.target || [];
                const field = target[0]?.replace(/["']/g, '') || 'A unique field';
                throw new AppError(`The ${field} is already in use.`, 400);
            }
            throw error;
        }
    }

    async getAllHospitalAdmins(query) {
        const admins = await prisma.user.findMany({
            where: {
                hospitalAdmin: { isNot: null }
            },
            include: {
                hospitalAdmin: true,
                hospital: { select: { id: true, hospitalName: true, hospitalCode: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Remove passwords
        return admins.map(admin => {
            const { password, ...safeAdmin } = admin;
            return safeAdmin;
        });
    }

    async getHospitalAdminById(id) {
        const admin = await prisma.user.findFirst({
            where: { 
                id,
                hospitalAdmin: { isNot: null }
            },
            include: {
                hospitalAdmin: true,
                hospital: true
            }
        });

        if (!admin) {
            throw new AppError("Hospital admin not found", 404);
        }

        const { password, ...safeAdmin } = admin;
        return safeAdmin;
    }

    async updateHospitalAdmin(id, data) {
        const { firstName, lastName, phone, employeeCode, isActive, status } = data;

        const admin = await this.getHospitalAdminById(id); // Ensures they exist and are an admin

        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Update User
                const updatedUser = await tx.user.update({
                    where: { id },
                    data: {
                        firstName: firstName !== undefined ? firstName : admin.firstName,
                        lastName: lastName !== undefined ? lastName : admin.lastName,
                        isActive: isActive !== undefined ? isActive : admin.isActive
                    }
                });

                // 2. Update Profile
                const updatedProfile = await tx.hospitalAdmin.update({
                    where: { userId: id },
                    data: {
                        phone: phone !== undefined ? phone : admin.hospitalAdmin?.phone,
                        employeeCode: employeeCode !== undefined ? employeeCode : admin.hospitalAdmin?.employeeCode,
                        status: status !== undefined ? status : admin.hospitalAdmin?.status
                    }
                });

                return { updatedUser, updatedProfile };
            });

            const { password, ...safeAdmin } = result.updatedUser;
            return { ...safeAdmin, hospitalAdmin: result.updatedProfile };
        } catch (error) {
            if (error.code === 'P2002') {
                const target = error.meta?.target || [];
                const field = target[0]?.replace(/["']/g, '') || 'A unique field';
                throw new AppError(`The ${field} is already in use.`, 400);
            }
            throw error;
        }
    }

    async deleteHospitalAdmin(id) {
        await this.getHospitalAdminById(id); // Verify existence

        // We can just delete the User, and Cascade will delete the HospitalAdmin profile
        await prisma.user.delete({ where: { id } });
        return null;
    }
}

export default HospitalAdminService;
