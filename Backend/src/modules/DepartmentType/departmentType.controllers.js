import DepartmentTypeService from "./departmentType.service.js";
import catchAsync from "../../utils/catchAsync.js";

export const createDepartmentType = catchAsync(async (req, res) => {
    const payload = { ...req.body };
    if (req.user?.branchAdmin?.branchId) {
        payload.branchId = req.user.branchAdmin.branchId;
        payload.hospitalId = req.user.branchAdmin.hospitalId;
    } else if (req.user?.hospitalId) {
        payload.hospitalId = req.user.hospitalId;
    }
    const departmentType = await DepartmentTypeService.createDepartmentType(payload);
    res.status(201).json({
        status: "success",
        message: "Department Type created successfully",
        data: departmentType
    });
});

export const getDepartmentTypes = catchAsync(async (req, res) => {
    const departmentTypes = await DepartmentTypeService.getAllDepartmentTypes(req.user, req.query);
    res.status(200).json({
        status: "success",
        message: "Department Types fetched successfully",
        data: departmentTypes
    });
});

export const getDepartmentTypeById = catchAsync(async (req, res) => {
    const departmentType = await DepartmentTypeService.getDepartmentTypeById(req.params.id, req.user);
    res.status(200).json({
        status: "success",
        message: "Department Type fetched successfully",
        data: departmentType
    });
});

export const updateDepartmentType = catchAsync(async (req, res) => {
    const departmentType = await DepartmentTypeService.updateDepartmentType(req.params.id, req.body, req.user);
    res.status(200).json({
        status: "success",
        message: "Department Type updated successfully",
        data: departmentType
    });
});

export const deleteDepartmentType = catchAsync(async (req, res) => {
    const departmentType = await DepartmentTypeService.deleteDepartmentType(req.params.id, req.user);
    res.status(200).json({
        status: "success",
        message: "Department Type deleted successfully",
        data: departmentType
    });
});
