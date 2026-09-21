import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";

class HospitalAdminService {
    async createHospitalAdmin(data) {
        const { hospitalId, firstName, lastName, email, password, phone, employeeCode, roleId, middleName, displayName, alternatePhone, profileImageUrl, status, isEmailVerified, isPhoneVerified, mfaEnabled } = data;

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

        // Verify role exists and actually belongs to this hospital (or is a
        // reusable hospital-agnostic template — never a different hospital's role)
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new AppError("Role not found", 404);
        }
        if (role.hospitalId && role.hospitalId !== hospitalId) {
            throw new AppError("This role does not belong to the specified hospital.", 400);
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
                        mobileNumber: data.phone || data.mobileNumber || null,
                        profilePhoto: data.profileImageUrl || data.profilePhoto || null,
                        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                        gender: data.gender || null,
                    }
                });

                // 2. Create HospitalAdmin Profile
                const hospitalAdmin = await tx.hospitalAdmin.create({
                    data: {
                        userId: user.id,
                        hospitalId,
                        employeeCode,
                        middleName,
                        displayName,
                        designation: data.designation || null,
                        department: data.department || null,
                        qualification: data.qualification || null,
                        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
                        officeExtension: data.officeExtension || null,
                        alternatePhone: alternatePhone || null,
                        emergencyContact: data.emergencyContact || null,
                        status: status || 'PENDING',
                        isEmailVerified: isEmailVerified || false,
                        isPhoneVerified: isPhoneVerified || false,
                        mfaEnabled: mfaEnabled || false,
                    }
                });

                // 3. Grant the role, scoped to this hospital (TENANT scope —
                // covers every branch of it). This — not a User<->Role
                // connect — is the actual authorization boundary.
                await tx.userRoleAssignment.create({
                    data: {
                        userId: user.id,
                        roleId: role.id,
                        hospitalId,
                        branchId: null,
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
        const { firstName, lastName, phone, mobileNumber, dateOfBirth, gender, profilePhoto, profileImageUrl, employeeCode, isActive, status, middleName, displayName, alternatePhone, designation, department, qualification, joiningDate, officeExtension, emergencyContact, isEmailVerified, isPhoneVerified, mfaEnabled } = data;

        const admin = await this.getHospitalAdminById(id); // Ensures they exist and are an admin

        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Update User
                const updatedUser = await tx.user.update({
                    where: { id },
                    data: {
                        firstName: firstName !== undefined ? firstName : admin.firstName,
                        lastName: lastName !== undefined ? lastName : admin.lastName,
                        mobileNumber: phone !== undefined || mobileNumber !== undefined ? (phone || mobileNumber) : admin.mobileNumber,
                        dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : admin.dateOfBirth,
                        gender: gender !== undefined ? gender : admin.gender,
                        profilePhoto: profilePhoto !== undefined || profileImageUrl !== undefined ? (profilePhoto || profileImageUrl) : admin.profilePhoto,
                        isActive: isActive !== undefined ? isActive : admin.isActive
                    }
                });

                // 2. Update Profile
                const updatedProfile = await tx.hospitalAdmin.update({
                    where: { userId: id },
                    data: {
                        employeeCode: employeeCode !== undefined ? employeeCode : admin.hospitalAdmin?.employeeCode,
                        status: status !== undefined ? status : admin.hospitalAdmin?.status,
                        middleName: middleName !== undefined ? middleName : admin.hospitalAdmin?.middleName,
                        displayName: displayName !== undefined ? displayName : admin.hospitalAdmin?.displayName,
                        designation: designation !== undefined ? designation : admin.hospitalAdmin?.designation,
                        department: department !== undefined ? department : admin.hospitalAdmin?.department,
                        qualification: qualification !== undefined ? qualification : admin.hospitalAdmin?.qualification,
                        joiningDate: joiningDate !== undefined ? (joiningDate ? new Date(joiningDate) : null) : admin.hospitalAdmin?.joiningDate,
                        officeExtension: officeExtension !== undefined ? officeExtension : admin.hospitalAdmin?.officeExtension,
                        alternatePhone: alternatePhone !== undefined ? alternatePhone : admin.hospitalAdmin?.alternatePhone,
                        emergencyContact: emergencyContact !== undefined ? emergencyContact : admin.hospitalAdmin?.emergencyContact,
                        isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : admin.hospitalAdmin?.isEmailVerified,
                        isPhoneVerified: isPhoneVerified !== undefined ? isPhoneVerified : admin.hospitalAdmin?.isPhoneVerified,
                        mfaEnabled: mfaEnabled !== undefined ? mfaEnabled : admin.hospitalAdmin?.mfaEnabled,
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
