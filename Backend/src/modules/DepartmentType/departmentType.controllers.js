import DepartmentTypeService from "./departmentType.service.js";
import catchAsync from "../../utils/catchAsync.js";

export const createDepartmentType = catchAsync(async (req, res) => {
    const departmentType = await DepartmentTypeService.createDepartmentType(req.body);
    res.status(201).json({
        status: "success",
        message: "Department Type created successfully",
        data: departmentType
    });
});

export const getDepartmentTypes = catchAsync(async (req, res) => {
    const departmentTypes = await DepartmentTypeService.getAllDepartmentTypes();
    res.status(200).json({
        status: "success",
        message: "Department Types fetched successfully",
        data: departmentTypes
    });
});

export const getDepartmentTypeById = catchAsync(async (req, res) => {
    const departmentType = await DepartmentTypeService.getDepartmentTypeById(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Department Type fetched successfully",
        data: departmentType
    });
});

export const updateDepartmentType = catchAsync(async (req, res) => {
    const departmentType = await DepartmentTypeService.updateDepartmentType(req.params.id, req.body);
    res.status(200).json({
        status: "success",
        message: "Department Type updated successfully",
        data: departmentType
    });
});

export const deleteDepartmentType = catchAsync(async (req, res) => {
    const departmentType = await DepartmentTypeService.deleteDepartmentType(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Department Type deleted successfully",
        data: departmentType
    });
});
