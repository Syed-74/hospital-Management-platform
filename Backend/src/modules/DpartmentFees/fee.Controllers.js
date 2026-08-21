import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import FeeService from "./fee.service.js";

const feeService = new FeeService();

export const createFee = catchAsync(async (req, res, next) => {
    const fee = await feeService.createFee(req.body);
    res.status(201).json({ status: "success", data: { fee } });
});

//Get all fees
export const getAllFees = catchAsync(async (req, res, next) => {
    const result = await feeService.getAllFees(req.query);
    res.status(200).json({ status: "success", data: result });
});

//Get fee by id
export const getFeeById = catchAsync(async (req, res, next) => {
    const fee = await feeService.getFeeById(req.params.id);
    res.status(200).json({ status: "success", data: { fee } });
});

//Update fee by id
export const updateFee = catchAsync(async (req, res, next) => {
    const fee = await feeService.updateFee(req.params.id, req.body);
    res.status(200).json({ status: "success", data: { fee } });
});

//Delete fee by id
export const deleteFee = catchAsync(async (req, res, next) => {
    await feeService.deleteFee(req.params.id);
    res.status(200).json({ status: "success", data: null });
});