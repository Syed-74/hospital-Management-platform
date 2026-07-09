import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import HospitalThemeService from "./hospitalTheme.service.js";

const hospitalThemeService = new HospitalThemeService();

export const createHospitalTheme = catchAsync(async (req, res, next) => {
    const hospitalTheme = await hospitalThemeService.createHospitalTheme(req.body);
    res.status(201).json({ status: "success", data: { hospitalTheme } });
});

export const getHospitalTheme = catchAsync(async (req, res, next) => {
    // Tenant isolation: if user is not a Platform Admin (e.g., they have a hospitalId), 
    // they can only fetch their own hospital's theme.
    if (req.user.hospitalId && req.user.hospitalId !== req.params.hospitalId) {
        return next(new AppError("You do not have permission to access this hospital's theme.", 403));
    }

    const hospitalTheme = await hospitalThemeService.getThemeByHospitalId(req.params.hospitalId);
    res.status(200).json({ status: "success", data: { hospitalTheme } });
});

export const updateHospitalTheme = catchAsync(async (req, res, next) => {
    const hospitalTheme = await hospitalThemeService.updateHospitalTheme(req.params.hospitalId, req.body);
    res.status(200).json({ status: "success", data: { hospitalTheme } });
});
