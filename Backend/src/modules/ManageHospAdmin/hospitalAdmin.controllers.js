import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import HospitalAdminService from "./hospitalAdmin.service.js";

const hospitalAdminService = new HospitalAdminService();

export const createHospitalAdmin = catchAsync(async (req, res, next) => {
    const admin = await hospitalAdminService.createHospitalAdmin(req.body);
    res.status(201).json({ status: "success", data: { admin } });
});

export const getAllHospitalAdmins = catchAsync(async (req, res, next) => {
    const admins = await hospitalAdminService.getAllHospitalAdmins(req.query);
    res.status(200).json({ status: "success", data: { admins } });
});

export const getHospitalAdminById = catchAsync(async (req, res, next) => {
    const admin = await hospitalAdminService.getHospitalAdminById(req.params.id);
    res.status(200).json({ status: "success", data: { admin } });
});

export const updateHospitalAdmin = catchAsync(async (req, res, next) => {
    const admin = await hospitalAdminService.updateHospitalAdmin(req.params.id, req.body);
    res.status(200).json({ status: "success", data: { admin } });
});

export const deleteHospitalAdmin = catchAsync(async (req, res, next) => {
    await hospitalAdminService.deleteHospitalAdmin(req.params.id);
    res.status(200).json({ status: "success", data: null });
});