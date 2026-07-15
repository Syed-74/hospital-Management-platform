import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export default class BranchService {
    
    // 1. Create a new branch under a specific hospital
    static async createBranch(hospitalId, branchData) {
        // Verify hospital exists
        const hospital = await prisma.hospital.findUnique({
            where: { id: hospitalId }
        });
        if (!hospital) {
            throw new AppError("Parent hospital not found", 404);
        }

        // Verify unique branchCode
        const existingBranch = await prisma.branchManage.findUnique({
            where: { branchCode: branchData.branchCode }
        });
        if (existingBranch) {
            throw new AppError(`Branch with code '${branchData.branchCode}' already exists`, 409);
        }

        return await prisma.branchManage.create({
            data: {
                ...branchData,
                hospitalId
            }
        });
    }

    // 2. Get all branches for a specific hospital
    static async getBranches(hospitalId) {
        return await prisma.branchManage.findMany({
            where: { hospitalId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 3. Get a single branch by ID
    static async getBranchById(id) {
        const branch = await prisma.branchManage.findUnique({
            where: { id },
            include: { hospital: true }
        });
        if (!branch) {
            throw new AppError("Branch not found", 404);
        }
        return branch;
    }

    // 4. Update a branch
    static async updateBranch(id, branchData) {
        // Verify branch exists
        const branch = await prisma.branchManage.findUnique({
            where: { id }
        });
        if (!branch) {
            throw new AppError("Branch not found", 404);
        }

        // Verify unique branchCode if changed
        if (branchData.branchCode && branchData.branchCode !== branch.branchCode) {
            const existingCode = await prisma.branchManage.findUnique({
                where: { branchCode: branchData.branchCode }
            });
            if (existingCode) {
                throw new AppError(`Branch with code '${branchData.branchCode}' already exists`, 409);
            }
        }

        return await prisma.branchManage.update({
            where: { id },
            data: branchData
        });
    }

    // 5. Delete a branch
    static async deleteBranch(id) {
        const branch = await prisma.branchManage.findUnique({
            where: { id }
        });
        if (!branch) {
            throw new AppError("Branch not found", 404);
        }

        return await prisma.branchManage.delete({
            where: { id }
        });
    }
}