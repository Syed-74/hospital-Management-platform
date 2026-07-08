import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import HospitalService from "./hospital.service.js";

const hospitalService = new HospitalService();

export const createHospital = catchAsync(async (req, res, next) => {
    if (req.file) {
        req.body.logo = `/uploads/hospitals/${req.file.filename}`;
    }
    
    const hospital = await hospitalService.createHospital(req.body);
    res.status(201).json({ status: "success", data: { hospital } });
});

//Get all hospitals
export const getAllHospitals = catchAsync(async (req, res, next) => {
    const result = await hospitalService.getAllHospitals(req.query);
    res.status(200).json({ status: "success", data: result });
});

//Get hospital by id
export const getHospitalById = catchAsync(async (req, res, next) => {
    const hospital = await hospitalService.getHospitalById(req.params.id);
    res.status(200).json({ status: "success", data: { hospital } });
});

//Update hospital by id
export const updateHospital = catchAsync(async (req, res, next) => {
    if (req.file) {
        req.body.logo = `/uploads/hospitals/${req.file.filename}`;
    }
    const hospital = await hospitalService.updateHospital(req.params.id, req.body);
    res.status(200).json({ status: "success", data: { hospital } });
});

//Delete hospital by id
export const deleteHospital = catchAsync(async (req, res, next) => {
    await hospitalService.deleteHospital(req.params.id);
    res.status(200).json({ status: "success", data: null });
});