import DepartmentService from "./department.service.js";
import catchAsync from "../../utils/catchAsync.js";

export const createDepartment = catchAsync(async (req, res) => {
    const department = await DepartmentService.createDepartment(req.body);
    res.status(201).json({
        status: "success",
        message: "Department created successfully",
        data: department
    });
});

export const getDepartments = catchAsync(async (req, res) => {
    const departments = await DepartmentService.getAllDepartments();
    res.status(200).json({
        status: "success",
        message: "Departments fetched successfully",
        data: departments
    });
});

export const getDepartmentById = catchAsync(async (req, res) => {
    const department = await DepartmentService.getDepartmentById(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Department fetched successfully",
        data: department
    });
});

export const updateDepartment = catchAsync(async (req, res) => {
    const department = await DepartmentService.updateDepartment(req.params.id, req.body);
    res.status(200).json({
        status: "success",
        message: "Department updated successfully",
        data: department
    });
});

export const deleteDepartment = catchAsync(async (req, res) => {
    const department = await DepartmentService.deleteDepartment(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Department deleted successfully",
        data: department
    });
});