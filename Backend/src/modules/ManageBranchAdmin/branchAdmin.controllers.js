import catchAsync from "../../utils/catchAsync.js";
import BranchAdminService from "./branchAdmin.service.js";

export const createBranchAdmin = catchAsync(async (req, res, next) => {
    // Assuming the authenticated user's hospitalId is attached or provided in body
    // If not, rely strictly on req.body
    const adminData = req.body;
    
    // Safety fallback: if creating an admin from a hospital context
    if (req.user && req.user.hospitalId && !adminData.hospitalId) {
        adminData.hospitalId = req.user.hospitalId;
    }

    const branchAdmin = await BranchAdminService.createBranchAdmin(adminData);
    res.status(201).json({ status: "success", data: { branchAdmin } });
});

export const getAllBranchAdmins = catchAsync(async (req, res, next) => {
    const { hospitalId } = req.query;
    // Or filter by req.user.hospitalId if it's a tenant admin
    const filterId = hospitalId || (req.user?.hospitalId);
    
    const branchAdmins = await BranchAdminService.getAllBranchAdmins(filterId);
    res.status(200).json({ status: "success", results: branchAdmins.length, data: { branchAdmins } });
});

export const getBranchAdminById = catchAsync(async (req, res, next) => {
    const branchAdmin = await BranchAdminService.getBranchAdminById(req.params.id);
    res.status(200).json({ status: "success", data: { branchAdmin } });
});

export const updateBranchAdmin = catchAsync(async (req, res, next) => {
    const branchAdmin = await BranchAdminService.updateBranchAdmin(req.params.id, req.body);
    res.status(200).json({ status: "success", data: { branchAdmin } });
});

export const deleteBranchAdmin = catchAsync(async (req, res, next) => {
    await BranchAdminService.deleteBranchAdmin(req.params.id);
    res.status(200).json({ status: "success", data: null });
});