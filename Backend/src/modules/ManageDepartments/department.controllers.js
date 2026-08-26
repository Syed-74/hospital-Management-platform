import DepartmentService from "./department.service.js";
import catchAsync from "../../utils/catchAsync.js";

export const createDepartment = catchAsync(async (req, res) => {
    const payload = { ...req.body };
    if (req.user?.branchAdmin?.branchId) {
        payload.branchId = req.user.branchAdmin.branchId;
        payload.hospitalId = req.user.branchAdmin.hospitalId;
    } else if (req.user?.hospitalId) {
        payload.hospitalId = req.user.hospitalId;
    }
    const department = await DepartmentService.createDepartment(payload);
    res.status(201).json({
        status: "success",
        message: "Department created successfully",
        data: department
    });
});

export const getDepartments = catchAsync(async (req, res) => {
    const departments = await DepartmentService.getAllDepartments(req.user, req.query);
    res.status(200).json({
        status: "success",
        message: "Departments fetched successfully",
        data: departments
    });
});

export const getDepartmentById = catchAsync(async (req, res) => {
    const department = await DepartmentService.getDepartmentById(req.params.id, req.user);
    res.status(200).json({
        status: "success",
        message: "Department fetched successfully",
        data: department
    });
});

export const updateDepartment = catchAsync(async (req, res) => {
    const department = await DepartmentService.updateDepartment(req.params.id, req.body, req.user);
    res.status(200).json({
        status: "success",
        message: "Department updated successfully",
        data: department
    });
});

export const deleteDepartment = catchAsync(async (req, res) => {
    const department = await DepartmentService.deleteDepartment(req.params.id, req.user);
    res.status(200).json({
        status: "success",
        message: "Department deleted successfully",
        data: department
    });
});