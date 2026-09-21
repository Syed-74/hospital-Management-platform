import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";

// A "Hospital Admin" is a User with an Employee record whose primary
// placement is hospital-level (EmploymentAssignment.branchId = null) — it
// is no longer a distinct profile model, so every query below filters
// through Employee/EmploymentAssignment instead of a dedicated table.
const HOSPITAL_ADMIN_INCLUDE = {
    employee: {
        include: {
            professionalProfile: true,
            assignments: { include: { branch: true, department: true } },
        },
    },
    hospital: { select: { id: true, hospitalName: true, hospitalCode: true } },
};

class HospitalAdminService {
    async createHospitalAdmin(data) {
        const { hospitalId, firstName, lastName, email, password, employeeCode, roleId, middleName, displayName, alternatePhone, status, isEmailVerified, isPhoneVerified, mfaEnabled } = data;

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
                // 1. Create User (pure identity)
                const user = await tx.user.create({
                    data: {
                        email,
                        firstName,
                        lastName,
                        hospitalId,
                        mobileNumber: data.phone || data.mobileNumber || null,
                        profilePhoto: data.profileImageUrl || data.profilePhoto || null,
                        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                        gender: data.gender || null,
                    }
                });

                // 2. Authentication concerns
                await tx.userCredential.create({
                    data: {
                        userId: user.id,
                        passwordHash: hashedPassword,
                        status: status || 'PENDING',
                        isEmailVerified: isEmailVerified || false,
                        isPhoneVerified: isPhoneVerified || false,
                    }
                });
                await tx.userMfaSetting.create({
                    data: {
                        userId: user.id,
                        isEnabled: mfaEnabled || false,
                    }
                });

                // 3. Employment record + hospital-level placement (branchId
                // null = covers the whole hospital, not a single branch).
                const employee = await tx.employee.create({
                    data: {
                        userId: user.id,
                        hospitalId,
                        employeeCode,
                        middleName,
                        displayName,
                        alternatePhone: alternatePhone || null,
                        officeExtension: data.officeExtension || null,
                        emergencyContact: data.emergencyContact || null,
                        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
                        ...(data.qualification
                            ? { professionalProfile: { create: { qualification: data.qualification } } }
                            : {}),
                        assignments: {
                            create: {
                                hospitalId,
                                branchId: null,
                                designation: data.designation || null,
                                isPrimary: true,
                            },
                        },
                    },
                    include: { professionalProfile: true, assignments: true },
                });

                // 4. Grant the role, scoped to this hospital (TENANT scope —
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

                return { user, employee };
            });

            return { ...result.user, employee: result.employee };
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
                employee: { assignments: { some: { branchId: null } } },
                ...(query?.hospitalId ? { hospitalId: query.hospitalId } : {}),
            },
            include: HOSPITAL_ADMIN_INCLUDE,
            orderBy: { createdAt: 'desc' }
        });

        return admins;
    }

    async getHospitalAdminById(id) {
        const admin = await prisma.user.findFirst({
            where: {
                id,
                employee: { assignments: { some: { branchId: null } } },
            },
            include: HOSPITAL_ADMIN_INCLUDE,
        });

        if (!admin) {
            throw new AppError("Hospital admin not found", 404);
        }

        return admin;
    }

    async updateHospitalAdmin(id, data) {
        const { firstName, lastName, phone, mobileNumber, dateOfBirth, gender, profilePhoto, profileImageUrl, employeeCode, isActive, status, middleName, displayName, alternatePhone, designation, qualification, joiningDate, officeExtension, emergencyContact, isEmailVerified, isPhoneVerified, mfaEnabled } = data;

        const admin = await this.getHospitalAdminById(id); // Ensures they exist and are an admin
        const employee = admin.employee;
        const primaryAssignment = employee.assignments.find((a) => !a.branchId) || employee.assignments[0];

        try {
            await prisma.$transaction(async (tx) => {
                // 1. Update User
                await tx.user.update({
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

                // 2. Update authentication state
                if (status !== undefined || isEmailVerified !== undefined || isPhoneVerified !== undefined) {
                    await tx.userCredential.update({
                        where: { userId: id },
                        data: {
                            ...(status !== undefined ? { status } : {}),
                            ...(isEmailVerified !== undefined ? { isEmailVerified } : {}),
                            ...(isPhoneVerified !== undefined ? { isPhoneVerified } : {}),
                        }
                    });
                }
                if (mfaEnabled !== undefined) {
                    await tx.userMfaSetting.update({
                        where: { userId: id },
                        data: { isEnabled: mfaEnabled },
                    });
                }

                // 3. Update employment record
                await tx.employee.update({
                    where: { id: employee.id },
                    data: {
                        employeeCode: employeeCode !== undefined ? employeeCode : employee.employeeCode,
                        middleName: middleName !== undefined ? middleName : employee.middleName,
                        displayName: displayName !== undefined ? displayName : employee.displayName,
                        joiningDate: joiningDate !== undefined ? (joiningDate ? new Date(joiningDate) : null) : employee.joiningDate,
                        officeExtension: officeExtension !== undefined ? officeExtension : employee.officeExtension,
                        alternatePhone: alternatePhone !== undefined ? alternatePhone : employee.alternatePhone,
                        emergencyContact: emergencyContact !== undefined ? emergencyContact : employee.emergencyContact,
                    }
                });

                // 4. Update placement / professional profile
                if (designation !== undefined && primaryAssignment) {
                    await tx.employmentAssignment.update({
                        where: { id: primaryAssignment.id },
                        data: { designation },
                    });
                }
                if (qualification !== undefined) {
                    await tx.professionalProfile.upsert({
                        where: { employeeId: employee.id },
                        update: { qualification },
                        create: { employeeId: employee.id, qualification },
                    });
                }
            });

            return await this.getHospitalAdminById(id);
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

        // Deleting the User cascades to its UserCredential, UserMfaSetting,
        // Employee (and the Employee's ProfessionalProfile,
        // EmploymentAssignment(s), EmployeeDocument(s)), and UserRoleAssignment(s).
        await prisma.user.delete({ where: { id } });
        return null;
    }
}

export default HospitalAdminService;
