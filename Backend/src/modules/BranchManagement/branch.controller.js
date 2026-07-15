import catchAsync from "../../utils/catchAsync.js";
import BranchService from "./branch.service.js";

// Helper to filter out dynamic branch settings fields
const sanitizeBranchData = (body) => {
    const { 
        branchName, branchCode, isMainBranch, 
        email, phone, alternatePhone, 
        addressLine1, addressLine2, city, state, country, postalCode, 
        timezone, currency, licenseNumber, isActive 
    } = body;
    return {
        branchName, branchCode, isMainBranch, 
        email, phone, alternatePhone, 
        addressLine1, addressLine2, city, state, country, postalCode, 
        timezone, currency, licenseNumber, isActive 
    };
};

export const createBranch = catchAsync(async (req, res, next) => {
    const { hospitalId } = req.params;
    const sanitizedData = sanitizeBranchData(req.body);
    const branch = await BranchService.createBranch(hospitalId, sanitizedData);
    res.status(201).json({ status: "success", data: { branch } });
});

export const getBranches = catchAsync(async (req, res, next) => {
    const { hospitalId } = req.params;
    const branches = await BranchService.getBranches(hospitalId);
    res.status(200).json({ status: "success", results: branches.length, data: { branches } });
});

export const getBranchById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const branch = await BranchService.getBranchById(id);
    res.status(200).json({ status: "success", data: { branch } });
});

export const updateBranch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const sanitizedData = sanitizeBranchData(req.body);
    const branch = await BranchService.updateBranch(id, sanitizedData);
    res.status(200).json({ status: "success", data: { branch } });
});

export const deleteBranch = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await BranchService.deleteBranch(id);
    res.status(204).json({ status: "success", data: null });
});
