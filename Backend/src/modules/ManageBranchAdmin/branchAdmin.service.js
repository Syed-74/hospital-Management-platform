import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";

// A "Branch Admin" is a User with an Employee record whose primary
// placement is branch-level (EmploymentAssignment.branchId set) — it is no
// longer a distinct profile model, so every query below filters through
// Employee/EmploymentAssignment instead of a dedicated table. The `:id`
// used throughout this module is the Employee's id (matching the old
// BranchAdmin.id contract, distinct from the User's id).
const BRANCH_ADMIN_INCLUDE = {
    user: { select: { id: true, email: true, firstName: true, lastName: true, mobileNumber: true, profilePhoto: true, gender: true, dateOfBirth: true, isActive: true } },
    professionalProfile: true,
    documents: true,
    assignments: { include: { branch: { select: { branchName: true, branchCode: true } }, department: true } },
    hospital: { select: { hospitalName: true } },
};

const DOCUMENT_LABELS = {
    identityDocument: "Identity Document",
    addressProof: "Address Proof",
    employmentProof: "Employment Proof",
    otherDocuments: "Other Documents",
};

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
            designation,
            departmentId,
            reportingManagerId,
            joiningDate,
            relievingDate,
            twoFactorEnabled,
            accountStatus,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            postalCode,
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

        // 1c. Department, if given, must belong to this branch
        if (departmentId) {
            const department = await prisma.manageDepartment.findUnique({ where: { id: departmentId } });
            if (!department) throw new AppError("Department not found", 404);
            if (department.branchId !== branchId) {
                throw new AppError("This department does not belong to the specified branch.", 400);
            }
        }

        // 2. Check unique constraints (email, employeeCode)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new AppError("Email is already registered", 409);

        if (employeeId) {
            const existingEmployee = await prisma.employee.findUnique({ where: { employeeCode: employeeId } });
            if (existingEmployee) throw new AppError("Employee ID already exists", 409);
        }

        // 3. Hash password
        const rawPassword = password || "BranchAdmin@123!";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        const fullName = `${firstName || ''} ${middleName ? middleName + ' ' : ''}${lastName || ''}`.trim();
        const alternatePhone = adminData.alternatePhoneNumber || adminData.alternatePhone || null;
        const hasProfessionalData = Boolean(license || qualification || certification);

        const documentEntries = Object.entries(DOCUMENT_LABELS)
            .map(([key, label]) => ({ label, fileUrl: adminData[key] }))
            .filter((d) => d.fileUrl);

        // 4. Create User, credential, Employee (+ placement, documents,
        // professional profile), and scoped role grant in one transaction
        return await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    hospitalId,
                    mobileNumber: mobileNumber || phoneNumber || phone || null,
                    profilePhoto: profilePhoto || null,
                    gender: gender || null,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                }
            });

            await tx.userCredential.create({
                data: {
                    userId: newUser.id,
                    passwordHash: hashedPassword,
                    status: accountStatus || 'PENDING',
                }
            });

            await tx.userMfaSetting.create({
                data: {
                    userId: newUser.id,
                    isEnabled: twoFactorEnabled === true || twoFactorEnabled === "true",
                }
            });

            const newEmployee = await tx.employee.create({
                data: {
                    userId: newUser.id,
                    hospitalId,
                    employeeCode: employeeId || null,
                    middleName: middleName || null,
                    displayName: fullName || null,
                    alternatePhone,
                    addressLine1: addressLine1 || null,
                    addressLine2: addressLine2 || null,
                    city: city || null,
                    state: state || null,
                    country: country || null,
                    postalCode: postalCode || null,
                    joiningDate: joiningDate ? new Date(joiningDate) : null,
                    relievingDate: relievingDate ? new Date(relievingDate) : null,
                    ...(hasProfessionalData
                        ? { professionalProfile: { create: { license: license || null, qualification: qualification || null, certification: certification || null } } }
                        : {}),
                    ...(documentEntries.length
                        ? { documents: { create: documentEntries.map((d) => ({ label: d.label, fileUrl: d.fileUrl })) } }
                        : {}),
                    assignments: {
                        create: {
                            hospitalId,
                            branchId,
                            departmentId: departmentId || null,
                            designation: designation || null,
                            reportingManagerId: reportingManagerId || null,
                            isPrimary: true,
                        },
                    },
                },
                include: BRANCH_ADMIN_INCLUDE,
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

            return newEmployee;
        });
    }

    static async getAllBranchAdmins(hospitalId) {
        const whereClause = {
            deletedAt: null,
            assignments: { some: { branchId: { not: null } } },
            ...(hospitalId ? { hospitalId } : {}),
        };
        return await prisma.employee.findMany({
            where: whereClause,
            include: BRANCH_ADMIN_INCLUDE,
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getBranchAdminById(id) {
        const admin = await prisma.employee.findFirst({
            where: { id, deletedAt: null, assignments: { some: { branchId: { not: null } } } },
            include: BRANCH_ADMIN_INCLUDE,
        });
        if (!admin) throw new AppError("Branch Admin not found", 404);
        return admin;
    }

    static async updateBranchAdmin(id, updateData, actingUser = null) {
        const admin = await this.getBranchAdminById(id);
        const primaryAssignment = admin.assignments.find((a) => a.isPrimary) || admin.assignments[0] || null;

        const {
            email,
            password,
            phone,
            phoneNumber,
            mobileNumber,
            firstName,
            lastName,
            profilePhoto,
            gender,
            dateOfBirth,
            roleId,
            branchId,
            departmentId,
            designation,
            reportingManagerId,
            employeeId,
            middleName,
            alternatePhone,
            alternatePhoneNumber,
            identityDocument,
            addressProof,
            employmentProof,
            otherDocuments,
            license,
            qualification,
            certification,
            joiningDate,
            relievingDate,
            twoFactorEnabled,
            accountStatus,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            postalCode,
        } = updateData;

        // Validate new role
        let newRole = null;
        if (roleId && roleId.trim() !== "") {
            newRole = await prisma.role.findUnique({ where: { id: roleId } });
            if (!newRole) throw new AppError("Role not found", 404);
            if (newRole.hospitalId && newRole.hospitalId !== admin.hospitalId) {
                throw new AppError("This role does not belong to this branch admin's hospital.", 400);
            }
        }

        // Validate branch
        let newBranchId = primaryAssignment?.branchId ?? null;
        if (branchId && branchId !== primaryAssignment?.branchId) {
            const branch = await prisma.branchManage.findUnique({ where: { id: branchId } });
            if (!branch) throw new AppError("Branch not found", 404);
            if (branch.hospitalId !== admin.hospitalId) {
                throw new AppError("This branch does not belong to this branch admin's hospital.", 400);
            }
            newBranchId = branchId;
        }

        // Validate department
        if (departmentId) {
            const department = await prisma.manageDepartment.findUnique({ where: { id: departmentId } });
            if (!department) throw new AppError("Department not found", 404);
            if (department.branchId !== newBranchId) {
                throw new AppError("This department does not belong to the specified branch.", 400);
            }
        }

        const userId = admin.user.id;

        return await prisma.$transaction(async (tx) => {
            // Update User fields
            const userUpdate = {};
            if (email !== undefined) userUpdate.email = email;
            if (firstName !== undefined) userUpdate.firstName = firstName;
            if (lastName !== undefined) userUpdate.lastName = lastName;
            if (mobileNumber !== undefined || phoneNumber !== undefined || phone !== undefined) {
                userUpdate.mobileNumber = mobileNumber || phoneNumber || phone;
            }
            if (profilePhoto !== undefined) userUpdate.profilePhoto = profilePhoto;
            if (gender !== undefined) userUpdate.gender = gender;
            if (dateOfBirth !== undefined) userUpdate.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

            if (Object.keys(userUpdate).length > 0) {
                await tx.user.update({ where: { id: userId }, data: userUpdate });
            }

            // Authentication concerns
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(password, salt);
                await tx.userCredential.upsert({
                    where: { userId },
                    update: { passwordHash },
                    create: { userId, passwordHash },
                });
            }
            if (accountStatus !== undefined) {
                // UserCredential always exists by this point — it is created
                // unconditionally in createBranchAdmin.
                await tx.userCredential.update({
                    where: { userId },
                    data: { status: accountStatus },
                });
            }
            if (twoFactorEnabled !== undefined) {
                const isEnabled = twoFactorEnabled === true || twoFactorEnabled === "true";
                await tx.userMfaSetting.upsert({
                    where: { userId },
                    update: { isEnabled },
                    create: { userId, isEnabled },
                });
            }

            // Employee fields
            const employeeUpdate = {};
            if (employeeId !== undefined) employeeUpdate.employeeCode = employeeId;
            if (middleName !== undefined) employeeUpdate.middleName = middleName;
            if (alternatePhone !== undefined || alternatePhoneNumber !== undefined) {
                employeeUpdate.alternatePhone = alternatePhone || alternatePhoneNumber;
            }
            if (addressLine1 !== undefined) employeeUpdate.addressLine1 = addressLine1;
            if (addressLine2 !== undefined) employeeUpdate.addressLine2 = addressLine2;
            if (city !== undefined) employeeUpdate.city = city;
            if (state !== undefined) employeeUpdate.state = state;
            if (country !== undefined) employeeUpdate.country = country;
            if (postalCode !== undefined) employeeUpdate.postalCode = postalCode;
            if (joiningDate !== undefined) employeeUpdate.joiningDate = joiningDate ? new Date(joiningDate) : null;
            if (relievingDate !== undefined) employeeUpdate.relievingDate = relievingDate ? new Date(relievingDate) : null;
            if (firstName !== undefined || middleName !== undefined || lastName !== undefined) {
                const fn = firstName !== undefined ? firstName : admin.user.firstName;
                const mn = middleName !== undefined ? middleName : admin.middleName;
                const ln = lastName !== undefined ? lastName : admin.user.lastName;
                employeeUpdate.displayName = `${fn || ''} ${mn ? mn + ' ' : ''}${ln || ''}`.trim();
            }

            if (Object.keys(employeeUpdate).length > 0) {
                await tx.employee.update({ where: { id: admin.id }, data: employeeUpdate });
            }

            // Professional profile
            if (license !== undefined || qualification !== undefined || certification !== undefined) {
                await tx.professionalProfile.upsert({
                    where: { employeeId: admin.id },
                    update: {
                        ...(license !== undefined ? { license } : {}),
                        ...(qualification !== undefined ? { qualification } : {}),
                        ...(certification !== undefined ? { certification } : {}),
                    },
                    create: { employeeId: admin.id, license, qualification, certification },
                });
            }

            // Ad-hoc documents (identity/address/employment/other)
            const documentUpdates = Object.entries(DOCUMENT_LABELS)
                .map(([key, label]) => ({ label, fileUrl: updateData[key] }))
                .filter((d) => d.fileUrl !== undefined);

            for (const doc of documentUpdates) {
                const existing = await tx.employeeDocument.findFirst({ where: { employeeId: admin.id, label: doc.label } });
                if (existing) {
                    await tx.employeeDocument.update({ where: { id: existing.id }, data: { fileUrl: doc.fileUrl } });
                } else if (doc.fileUrl) {
                    await tx.employeeDocument.create({ data: { employeeId: admin.id, label: doc.label, fileUrl: doc.fileUrl } });
                }
            }

            // Reconcile placement (branch / department / designation / reporting line)
            const assignmentUpdate = {};
            if (newBranchId !== primaryAssignment?.branchId) assignmentUpdate.branchId = newBranchId;
            if (departmentId !== undefined) assignmentUpdate.departmentId = departmentId || null;
            if (designation !== undefined) assignmentUpdate.designation = designation;
            if (reportingManagerId !== undefined) assignmentUpdate.reportingManagerId = reportingManagerId || null;

            if (Object.keys(assignmentUpdate).length > 0 && primaryAssignment) {
                await tx.employmentAssignment.update({
                    where: { id: primaryAssignment.id },
                    data: assignmentUpdate,
                });
            }

            // Reconcile role grant assignment — re-derive the role(s) actually
            // held at the OLD scope (never a denormalized shortcut) so a
            // branch change alone doesn't silently drop existing grants.
            if (newRole || newBranchId !== primaryAssignment?.branchId) {
                const existingAssignments = await tx.userRoleAssignment.findMany({
                    where: { userId, hospitalId: admin.hospitalId, branchId: primaryAssignment?.branchId ?? null },
                });
                const roleIdsToGrant = newRole ? [newRole.id] : existingAssignments.map((a) => a.roleId);

                await tx.userRoleAssignment.deleteMany({
                    where: { userId, hospitalId: admin.hospitalId, branchId: primaryAssignment?.branchId ?? null },
                });

                for (const grantedRoleId of roleIdsToGrant) {
                    await tx.userRoleAssignment.create({
                        data: {
                            userId,
                            roleId: grantedRoleId,
                            hospitalId: admin.hospitalId,
                            branchId: newBranchId,
                            assignedBy: actingUser?.id || null,
                        }
                    });
                }
            }

            return await tx.employee.findUnique({
                where: { id: admin.id },
                include: BRANCH_ADMIN_INCLUDE,
            });
        });
    }

    static async deleteBranchAdmin(id) {
        const admin = await this.getBranchAdminById(id);

        // Deleting the User cascades to UserCredential, UserMfaSetting,
        // Employee (and its ProfessionalProfile/EmploymentAssignment(s)/
        // EmployeeDocument(s)), and UserRoleAssignment(s).
        await prisma.user.delete({ where: { id: admin.user.id } });
        return admin;
    }
}
