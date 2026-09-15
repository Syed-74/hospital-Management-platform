import { prisma } from "../../config/db.js";

class BranchWardService {
    async createBranchWard(data) {
        const { hospitalId, ...wardData } = data;
        if (wardData.capacity !== undefined) {
            wardData.capacity = parseInt(wardData.capacity, 10) || 1;
        }
        if (!wardData.floorId || (typeof wardData.floorId === "string" && !wardData.floorId.trim())) {
            delete wardData.floorId;
        }
        if (!wardData.roomId || (typeof wardData.roomId === "string" && !wardData.roomId.trim())) {
            delete wardData.roomId;
        }

        return prisma.branchWard.create({
            data: wardData,
            include: { branch: true, floor: true, room: true },
        });
    }

    async getAllBranchWards(query = {}) {
        const { branchId, search, page = 1, limit = 50 } = query;
        const where = {};
        if (branchId) where.branchId = branchId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { type: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 50);
        const skip = (pageNum - 1) * limitNum;

        return prisma.branchWard.findMany({
            where,
            take: limitNum,
            skip: skip,
            include: { branch: true, floor: true, room: true },
        });
    }

    async getBranchWardById(id) {
        return prisma.branchWard.findUnique({
            where: { id },
            include: { branch: true, floor: true, room: true },
        });
    }

    async updateBranchWard(id, data) {
        const { hospitalId, ...wardData } = data;
        if (wardData.capacity !== undefined) {
            wardData.capacity = parseInt(wardData.capacity, 10) || 1;
        }
        if (wardData.floorId !== undefined) {
            if (!wardData.floorId || (typeof wardData.floorId === "string" && !wardData.floorId.trim())) {
                wardData.floorId = null;
            }
        }
        if (wardData.roomId !== undefined) {
            if (!wardData.roomId || (typeof wardData.roomId === "string" && !wardData.roomId.trim())) {
                wardData.roomId = null;
            }
        }

        return prisma.branchWard.update({
            where: { id },
            data: wardData,
            include: { branch: true, floor: true, room: true },
        });
    }

    async deleteBranchWard(id) {
        return prisma.branchWard.delete({
            where: { id },
        });
    }
}

export default new BranchWardService();