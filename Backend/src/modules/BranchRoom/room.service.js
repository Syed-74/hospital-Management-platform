import AppError from "../../utils/AppError.js";
import { prisma } from "../../config/db.js";

class BranchRoomService {
    // Helper function to validate that the branch belongs to the hospital
    async _assertBranchBelongsToHospital(hospitalId, branchId) {
        if (!hospitalId || !branchId) return;
        const branch = await prisma.branchManage.findUnique({
            where: { id: branchId }
        });
        if (!branch) throw new AppError("Branch not found.", 404);
        if (branch.hospitalId !== hospitalId) {
            throw new AppError("This branch does not belong to the specified hospital.", 400);
        }
    }

    // Create a new branch room
    async createBranchRoom(data) {
        const { hospitalId, ...roomData } = data;
        await this._assertBranchBelongsToHospital(hospitalId, roomData.branchId);

        if (roomData.capacity !== undefined) {
            roomData.capacity = parseInt(roomData.capacity, 10) || 1;
        }
        if (!roomData.floorId || (typeof roomData.floorId === "string" && !roomData.floorId.trim())) {
            delete roomData.floorId;
        }

        const room = await prisma.branchRoom.create({
            data: roomData,
            include: {
                branch: true,
                floor: true
            }
        });
        return room;
    }

    // Get all branch rooms
    async getAllBranchRooms(query = {}) {
        const { branchId, search, page = 1, limit = 50, type, isAvailable } = query;
        const whereClause = {};

        if (branchId) {
            whereClause.branchId = branchId;
        }
        if (type) {
            whereClause.type = type;
        }
        if (isAvailable !== undefined && isAvailable !== "ALL" && isAvailable !== "") {
            whereClause.isAvailable = isAvailable === 'true' || isAvailable === true;
        }
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { type: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 50);
        const skip = (pageNum - 1) * limitNum;

        const rooms = await prisma.branchRoom.findMany({
            where: whereClause,
            take: limitNum,
            skip: skip,
            include: {
                branch: true,
                floor: true
            }
        });
        return rooms;
    }

    // Get branch room by ID
    async getBranchRoomById(id) {
        const room = await prisma.branchRoom.findUnique({
            where: { id },
            include: {
                branch: true,
                floor: true
            }
        });

        if (!room) {
            throw new AppError("Branch Room not found", 404);
        }

        return room;
    }

    // Update branch room
    async updateBranchRoom(id, data) {
        const existingRoom = await prisma.branchRoom.findUnique({
            where: { id }
        });

        if (!existingRoom) {
            throw new AppError("Branch Room not found", 404);
        }

        const { hospitalId, ...updateData } = data;
        if (updateData.branchId && updateData.branchId !== existingRoom.branchId) {
            await this._assertBranchBelongsToHospital(hospitalId, updateData.branchId);
        }

        if (updateData.capacity !== undefined) {
            updateData.capacity = parseInt(updateData.capacity, 10) || 1;
        }
        if (updateData.floorId !== undefined) {
            if (!updateData.floorId || (typeof updateData.floorId === "string" && !updateData.floorId.trim())) {
                updateData.floorId = null;
            }
        }

        const updatedRoom = await prisma.branchRoom.update({
            where: { id },
            data: updateData,
            include: {
                branch: true,
                floor: true
            }
        });

        return updatedRoom;
    }

    // Delete branch room
    async deleteBranchRoom(id) {
        const existingRoom = await prisma.branchRoom.findUnique({
            where: { id }
        });

        if (!existingRoom) {
            throw new AppError("Branch Room not found", 404);
        }

        await prisma.branchRoom.delete({
            where: { id }
        });

        return existingRoom;
    }
}

export default new BranchRoomService();