import catchAsync from "../../utils/catchAsync.js";
import wardservice from "./ward.service.js";
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

export const createBranchWard = catchAsync(async (req, res, next) => {
    const payload = { ...req.body };
    if (!payload.branchId) {
        payload.branchId = await resolveUserBranchId(req);
    }

    if (!payload.branchId) {
        return next(new AppError("Branch ID is required to create a ward. Please create a hospital branch first.", 400));
    }

    const ward = await wardservice.createBranchWard(payload);
    res.status(201).json({
        status: "success",
        message: "Branch Ward created successfully",
        data: ward
    });
});

export const getAllBranchWards = catchAsync(async (req, res) => {
    const query = { ...req.query };
    if (!query.branchId) {
        query.branchId = await resolveUserBranchId(req);
    }
    const wards = await wardservice.getAllBranchWards(query);
    res.status(200).json({
        status: "success",
        message: "Branch Wards fetched successfully",
        data: wards
    });
});

export const getBranchWardById = catchAsync(async (req, res) => {
    const ward = await wardservice.getBranchWardById(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Branch Ward fetched successfully",
        data: ward
    });
});

export const updateBranchWard = catchAsync(async (req, res) => {
    const ward = await wardservice.updateBranchWard(req.params.id, req.body);
    res.status(200).json({
        status: "success",
        message: "Branch Ward updated successfully",
        data: ward
    });
});

export const deleteBranchWard = catchAsync(async (req, res) => {
    const ward = await wardservice.deleteBranchWard(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Branch Ward deleted successfully",
        data: ward
    });
});