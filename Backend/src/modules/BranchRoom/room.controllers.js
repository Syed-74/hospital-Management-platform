import RoomService from "./room.service.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { prisma } from "../../config/db.js";

async function resolveUserBranchId(req) {
    if (req.body?.branchId) return req.body.branchId;
    if (req.query?.branchId) return req.query.branchId;

    if (req.user?.branchAdmin?.branchId) {
        return req.user.branchAdmin.branchId;
    }

    if (req.user?.roleAssignments && req.user.roleAssignments.length > 0) {
        const assignment = req.user.roleAssignments.find(a => a.branchId);
        if (assignment?.branchId) return assignment.branchId;
    }

    if (req.user?.hospitalId) {
        const firstBranch = await prisma.branchManage.findFirst({
            where: { hospitalId: req.user.hospitalId, isActive: true },
            select: { id: true }
        });
        if (firstBranch) return firstBranch.id;
    }

    // Fallback: search any active branch in the system if superadmin/platform admin
    const fallbackBranch = await prisma.branchManage.findFirst({
        where: { isActive: true },
        select: { id: true }
    });
    return fallbackBranch?.id || null;
}

export const createBranchRoom = catchAsync(async (req, res, next) => {
    const payload = { ...req.body };
    if (!payload.branchId) {
        payload.branchId = await resolveUserBranchId(req);
    }

    if (!payload.branchId) {
        return next(new AppError("Branch ID is required to create a room. Please create a hospital branch first.", 400));
    }

    const room = await RoomService.createBranchRoom(payload);
    res.status(201).json({
        status: "success",
        message: "Branch Room created successfully",
        data: room
    });
});

export const getAllBranchRooms = catchAsync(async (req, res) => {
    const query = { ...req.query };
    if (!query.branchId) {
        query.branchId = await resolveUserBranchId(req);
    }
    const rooms = await RoomService.getAllBranchRooms(query);
    res.status(200).json({
        status: "success",
        message: "Branch Rooms fetched successfully",
        data: rooms
    });
});

export const getBranchRoomById = catchAsync(async (req, res) => {
    const room = await RoomService.getBranchRoomById(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Branch Room fetched successfully",
        data: room
    });
});

export const updateBranchRoom = catchAsync(async (req, res) => {
    const room = await RoomService.updateBranchRoom(req.params.id, req.body);
    res.status(200).json({
        status: "success",
        message: "Branch Room updated successfully",
        data: room
    });
});

export const deleteBranchRoom = catchAsync(async (req, res) => {
    const room = await RoomService.deleteBranchRoom(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Branch Room deleted successfully",
        data: room
    });
});