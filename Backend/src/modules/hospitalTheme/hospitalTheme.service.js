import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export default class HospitalThemeService {
    
    // Extract allowed fields to prevent overposting
    _sanitizeThemeData(data) {
        const allowedFields = [
            'hospitalLogo', 'favicon', 'loginBackground',
            'primaryColor', 'secondaryColor', 'accentColor',
            'sidebarColor', 'sidebarTextColor', 'headerColor',
            'headerTextColor', 'backgroundColor', 'cardColor',
            'borderColor', 'buttonColor', 'buttonTextColor',
            'linkColor', 'successColor', 'warningColor', 'errorColor',
            'fontFamily', 'fontSize', 'themeMode', 'borderRadius',
            'showHospitalLogo', 'showHospitalName', 'enableAnimations'
        ];

        const sanitized = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                sanitized[field] = data[field];
            }
        }
        return sanitized;
    }

    async createHospitalTheme(data) {
        const { hospitalId } = data;

        if (!hospitalId) {
            throw new AppError("hospitalId is required to create a theme", 400);
        }

        const existingTheme = await prisma.hospitalTheme.findUnique({
            where: { hospitalId },
        });

        if (existingTheme) {
            throw new AppError("Hospital theme already exists for this hospital. Please update it instead.", 400);
        }

        const sanitizedData = this._sanitizeThemeData(data);
        sanitizedData.hospitalId = hospitalId;

        try {
            const hospitalTheme = await prisma.hospitalTheme.create({
                data: sanitizedData,
            });
            return hospitalTheme;
        } catch (error) {
            if (error.code === 'P2002') {
                const target = error.meta?.target || (error.meta?.driverAdapterError?.cause?.constraint?.fields) || [];
                const field = target[0]?.replace(/["']/g, '') || 'A unique field';
                throw new AppError(`The ${field} is already in use. Please use another one.`, 400);
            }
            throw error;
        }
    }

    async getThemeByHospitalId(hospitalId) {
        if (!hospitalId) {
            throw new AppError("hospitalId is required", 400);
        }

        const theme = await prisma.hospitalTheme.findUnique({
            where: { hospitalId },
        });

        if (!theme) {
            throw new AppError("Hospital theme not found", 404);
        }

        return theme;
    }

    async updateHospitalTheme(hospitalId, data) {
        if (!hospitalId) {
            throw new AppError("hospitalId is required", 400);
        }

        const existingTheme = await prisma.hospitalTheme.findUnique({
            where: { hospitalId },
        });

        if (!existingTheme) {
            throw new AppError("Hospital theme not found", 404);
        }

        const sanitizedData = this._sanitizeThemeData(data);

        try {
            const updatedTheme = await prisma.hospitalTheme.update({
                where: { hospitalId },
                data: sanitizedData,
            });
            return updatedTheme;
        } catch (error) {
            if (error.code === 'P2002') {
                const target = error.meta?.target || (error.meta?.driverAdapterError?.cause?.constraint?.fields) || [];
                const field = target[0]?.replace(/["']/g, '') || 'A unique field';
                throw new AppError(`The ${field} is already in use. Please use another one.`, 400);
            }
            throw error;
        }
    }
}
