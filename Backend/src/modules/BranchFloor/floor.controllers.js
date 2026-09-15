import floorService from "./floor.service.js";
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

    const fallbackBranch = await prisma.branchManage.findFirst({
        where: { isActive: true },
        select: { id: true }
    });
    return fallbackBranch?.id || null;
}

export const createBranchFloor = catchAsync(async (req, res, next) => {
    const payload = { ...req.body };
    if (!payload.branchId) {
        payload.branchId = await resolveUserBranchId(req);
    }

    if (!payload.branchId) {
        return next(new AppError("Branch ID is required to create a floor. Please create a hospital branch first.", 400));
    }

    const floor = await floorService.createBranchFloor(payload);
    res.status(201).json({
        status: "success",
        message: "Branch Floor created successfully",
        data: floor
    });
});

export const getAllBranchFloors = catchAsync(async (req, res) => {
    const query = { ...req.query };
    if (!query.branchId) {
        query.branchId = await resolveUserBranchId(req);
    }
    const floors = await floorService.getAllBranchFloors(query);
    res.status(200).json({
        status: "success",
        message: "Branch Floors fetched successfully",
        data: floors
    });
});

export const getBranchFloorById = catchAsync(async (req, res) => {
    const floor = await floorService.getBranchFloorById(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Branch Floor fetched successfully",
        data: floor
    });
});

export const updateBranchFloor = catchAsync(async (req, res) => {
    const floor = await floorService.updateBranchFloor(req.params.id, req.body);
    res.status(200).json({
        status: "success",
        message: "Branch Floor updated successfully",
        data: floor
    });
});

export const deleteBranchFloor = catchAsync(async (req, res) => {
    const floor = await floorService.deleteBranchFloor(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Branch Floor deleted successfully",
        data: floor
    });
});
