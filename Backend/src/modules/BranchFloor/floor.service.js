import { prisma } from "../../config/db.js";

class BranchFloorService {
    async createBranchFloor(data) {
        const { hospitalId, ...floorData } = data;
        if (floorData.capacity !== undefined) {
            floorData.capacity = parseInt(floorData.capacity, 10) || 1;
        }

        return prisma.branchFloor.create({ data: floorData });
    }

    async getAllBranchFloors(query = {}) {
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

        return prisma.branchFloor.findMany({
            where,
            take: limitNum,
            skip: skip,
            include: { branch: true },
        });
    }

    async getBranchFloorById(id) {
        return prisma.branchFloor.findUnique({
            where: { id },
            include: { branch: true },
        });
    }

    async updateBranchFloor(id, data) {
        const { hospitalId, ...floorData } = data;
        if (floorData.capacity !== undefined) {
            floorData.capacity = parseInt(floorData.capacity, 10) || 1;
        }

        return prisma.branchFloor.update({
            where: { id },
            data: floorData,
        });
    }

    async deleteBranchFloor(id) {
        return prisma.branchFloor.delete({
            where: { id },
        });
    }
}

export default new BranchFloorService();
