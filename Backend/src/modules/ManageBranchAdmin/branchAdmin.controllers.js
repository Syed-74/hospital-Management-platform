import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import BranchAdminService from "./branchAdmin.service.js";

export const createBranchAdmin = catchAsync(async (req, res, next) => {
    const adminData = { ...req.body };

    if (req.user?.hospitalId) {
        // Hospital-bound callers (Hospital Admin) can only ever create
        // branch admins within their own hospital — a client-supplied
        // hospitalId in the body is never trusted, even if present.
        adminData.hospitalId = req.user.hospitalId;
    } else if (!adminData.hospitalId) {
        return next(new AppError("hospitalId is required.", 400));
    }

    const branchAdmin = await BranchAdminService.createBranchAdmin(adminData, req.user);
    res.status(201).json({ status: "success", data: { branchAdmin } });
});

export const getAllBranchAdmins = catchAsync(async (req, res, next) => {
    // Hospital-bound callers always get their own hospital's roster —
    // the query string can never override that. Only a platform-level
    // caller (no hospitalId) may filter by an arbitrary hospitalId.
    const filterId = req.user?.hospitalId || req.query.hospitalId;

    const branchAdmins = await BranchAdminService.getAllBranchAdmins(filterId);
    res.status(200).json({ status: "success", results: branchAdmins.length, data: { branchAdmins } });
});

export const getBranchAdminById = catchAsync(async (req, res, next) => {
    const branchAdmin = await BranchAdminService.getBranchAdminById(req.params.id);
    res.status(200).json({ status: "success", data: { branchAdmin } });
});

export const updateBranchAdmin = catchAsync(async (req, res, next) => {
    const branchAdmin = await BranchAdminService.updateBranchAdmin(req.params.id, req.body, req.user);
    res.status(200).json({ status: "success", data: { branchAdmin } });
});

export const deleteBranchAdmin = catchAsync(async (req, res, next) => {
    await BranchAdminService.deleteBranchAdmin(req.params.id);
    res.status(200).json({ status: "success", data: null });
});
