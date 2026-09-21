import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";

export default class BranchAdminService {
    static async createBranchAdmin(adminData, actingUser = null) {
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
            mobileNumber,
            profilePhoto,
            gender,
            dateOfBirth,
            roleId,
            identityDocument,
            addressProof,
            employmentProof,
            otherDocuments,
            license,
            qualification,
            certification,
            ...rest
        } = adminData;

        // 1. Verify hospital and branch exist
        const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
        if (!hospital) throw new AppError("Hospital not found", 404);

        const branch = await prisma.branchManage.findUnique({ where: { id: branchId } });
        if (!branch) throw new AppError("Branch not found", 404);
        if (branch.hospitalId !== hospitalId) {
            throw new AppError("This branch does not belong to the specified hospital.", 400);
        }

        // 1b. Role verification
        let role = null;
        if (roleId && roleId.trim() !== "") {
            role = await prisma.role.findUnique({ where: { id: roleId } });
            if (!role) throw new AppError("Role not found", 404);
            if (role.hospitalId && role.hospitalId !== hospitalId) {
                throw new AppError("This role does not belong to the specified hospital.", 400);
            }
        }

        // 2. Check unique constraints (email, employeeId)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new AppError("Email is already registered", 409);

        if (employeeId) {
            const existingEmployee = await prisma.branchAdmin.findUnique({ where: { employeeId } });
            if (existingEmployee) throw new AppError("Employee ID already exists", 409);
        }

        // 3. Hash password
        const rawPassword = password || "BranchAdmin@123!";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // Prepare branch admin data for BranchAdmin table (excluding User table attributes)
        const branchAdminData = {
            ...rest,
            userId: "", // Set after user creation
            hospitalId,
            branchId,
            middleName: middleName || null,
            employeeId: employeeId || null,
            fullName: `${firstName || ''} ${middleName ? middleName + ' ' : ''}${lastName || ''}`.trim(),
            alternatePhoneNumber: adminData.alternatePhoneNumber || adminData.alternatePhone || null,
            identityDocument: identityDocument || null,
            addressProof: addressProof || null,
            employmentProof: employmentProof || null,
            otherDocuments: otherDocuments || null,
            license: license || null,
            qualification: qualification || null,
            certification: certification || null,
        };

        if (roleId && roleId.trim() !== "") {
            branchAdminData.roleId = roleId;
        }

        // Parse Date fields into ISO-8601 strings for Prisma
        if (adminData.joiningDate) branchAdminData.joiningDate = new Date(adminData.joiningDate).toISOString();
        if (adminData.relievingDate) branchAdminData.relievingDate = new Date(adminData.relievingDate).toISOString();
        
        // Parse booleans
        if (adminData.twoFactorEnabled !== undefined) branchAdminData.twoFactorEnabled = adminData.twoFactorEnabled === true || adminData.twoFactorEnabled === "true";

        // 4. Create User, BranchAdmin profile, and scoped role grant in transaction
        return await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    hospitalId,
                    mobileNumber: mobileNumber || phoneNumber || phone || null,
                    profilePhoto: profilePhoto || null,
                    gender: gender || null,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                }
            });

            branchAdminData.userId = newUser.id;

            const newBranchAdmin = await tx.branchAdmin.create({
                data: branchAdminData,
                include: {
                    user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true, profilePhoto: true, gender: true, dateOfBirth: true, isActive: true } },
                    branch: { select: { branchName: true, branchCode: true } },
                    hospital: { select: { hospitalName: true } }
                }
            });

            if (role) {
                await tx.userRoleAssignment.create({
                    data: {
                        userId: newUser.id,
                        roleId: role.id,
                        hospitalId,
                        branchId,
                        assignedBy: actingUser?.id || null,
                    }
                });
            }

            return newBranchAdmin;
        });
    }

    static async getAllBranchAdmins(hospitalId) {
        const whereClause = hospitalId ? { hospitalId, deletedAt: null } : { deletedAt: null };
        return await prisma.branchAdmin.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true, profilePhoto: true, gender: true, dateOfBirth: true, isActive: true } },
                branch: { select: { branchName: true, branchCode: true } },
                hospital: { select: { hospitalName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getBranchAdminById(id) {
        const admin = await prisma.branchAdmin.findFirst({
            where: { id, deletedAt: null },
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true, profilePhoto: true, gender: true, dateOfBirth: true, isActive: true } },
                branch: { select: { branchName: true, branchCode: true } },
                hospital: { select: { hospitalName: true } }
            }
        });
        if (!admin) throw new AppError("Branch Admin not found", 404);
        return admin;
    }

    static async updateBranchAdmin(id, updateData, actingUser = null) {
        const admin = await prisma.branchAdmin.findUnique({ where: { id } });
        if (!admin) throw new AppError("Branch Admin not found", 404);

        const { 
            email, 
            password, 
            userId, 
            hospitalId, 
            branchId, 
            phone, 
            phoneNumber, 
            mobileNumber, 
            firstName, 
            lastName, 
            profilePhoto, 
            gender, 
            dateOfBirth, 
            roleId, 
            ...safeData 
        } = updateData;

        // Map alternate phone if provided
        if (updateData.alternatePhone || updateData.alternatePhoneNumber) {
            safeData.alternatePhoneNumber = updateData.alternatePhone || updateData.alternatePhoneNumber;
        }

        // Validate new role
        let newRole = null;
        if (roleId && roleId.trim() !== "") {
            newRole = await prisma.role.findUnique({ where: { id: roleId } });
            if (!newRole) throw new AppError("Role not found", 404);
            if (newRole.hospitalId && newRole.hospitalId !== admin.hospitalId) {
                throw new AppError("This role does not belong to this branch admin's hospital.", 400);
            }
            safeData.roleId = roleId;
        }

        // Validate branch
        let newBranchId = admin.branchId;
        if (branchId && branchId !== admin.branchId) {
            const branch = await prisma.branchManage.findUnique({ where: { id: branchId } });
            if (!branch) throw new AppError("Branch not found", 404);
            if (branch.hospitalId !== admin.hospitalId) {
                throw new AppError("This branch does not belong to this branch admin's hospital.", 400);
            }
            safeData.branchId = branchId;
            newBranchId = branchId;
        }

        // Parse Date fields into ISO-8601 strings for Prisma
        if (updateData.joiningDate) safeData.joiningDate = new Date(updateData.joiningDate).toISOString();
        if (updateData.relievingDate) safeData.relievingDate = new Date(updateData.relievingDate).toISOString();
        
        // Parse booleans
        if (updateData.twoFactorEnabled !== undefined) safeData.twoFactorEnabled = updateData.twoFactorEnabled === true || updateData.twoFactorEnabled === "true";

        return await prisma.$transaction(async (tx) => {
            // Update User fields
            const userUpdate = {};
            if (email) userUpdate.email = email;
            if (firstName !== undefined) userUpdate.firstName = firstName;
            if (lastName !== undefined) userUpdate.lastName = lastName;
            if (mobileNumber !== undefined || phoneNumber !== undefined || phone !== undefined) {
                userUpdate.mobileNumber = mobileNumber || phoneNumber || phone;
            }
            if (profilePhoto !== undefined) userUpdate.profilePhoto = profilePhoto;
            if (gender !== undefined) userUpdate.gender = gender;
            if (dateOfBirth !== undefined) userUpdate.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

            if (password) {
                const salt = await bcrypt.genSalt(10);
                userUpdate.password = await bcrypt.hash(password, salt);
            }

            if (Object.keys(userUpdate).length > 0) {
                await tx.user.update({
                    where: { id: admin.userId },
                    data: userUpdate
                });
            }

            // Reconcile role grant assignment
            if (newRole || newBranchId !== admin.branchId) {
                await tx.userRoleAssignment.deleteMany({
                    where: { userId: admin.userId, hospitalId: admin.hospitalId, branchId: admin.branchId }
                });

                const roleToGrant = newRole?.id || admin.roleId;
                if (roleToGrant) {
                    await tx.userRoleAssignment.create({
                        data: {
                            userId: admin.userId,
                            roleId: roleToGrant,
                            hospitalId: admin.hospitalId,
                            branchId: newBranchId,
                            assignedBy: actingUser?.id || null,
                        }
                    });
                }
            }

            return await tx.branchAdmin.update({
                where: { id },
                data: safeData,
                include: {
                    user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true, profilePhoto: true, gender: true, dateOfBirth: true, isActive: true } },
                    branch: { select: { branchName: true, branchCode: true } },
                    hospital: { select: { hospitalName: true } }
                }
            });
        });
    }

    static async deleteBranchAdmin(id) {
        const admin = await prisma.branchAdmin.findUnique({ where: { id } });
        if (!admin) throw new AppError("Branch Admin not found", 404);

        // Hard delete branch admin and user
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
