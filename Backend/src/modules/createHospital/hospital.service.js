import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

export default class HospitalService {
    // Create a new hospital
    async createHospital(data) {
        const { email, phone, hospitalName, hospitalCode, addressLine1, city, state, country, postalCode } = data;

        if (!email || !phone || !hospitalName || !hospitalCode || !addressLine1 || !city || !state || !country || !postalCode) {
            throw new AppError("All fields are required", 400);
        }

        const existingHospital = await prisma.hospital.findUnique({
            where: { hospitalCode },
        });

        if (existingHospital) {
            throw new AppError("Hospital code already exists", 400);
        }

        try {
            const hospital = await prisma.hospital.create({
                data,
            });
            return hospital;
        } catch (error) {
            // Handle Prisma unique constraint violation
            if (error.code === 'P2002') {
                let target = error.meta?.target || [];
                if (error.meta?.driverAdapterError?.cause?.constraint?.fields) {
                    target = error.meta.driverAdapterError.cause.constraint.fields;
                }
                const field = target[0]?.replace(/["']/g, '') || 'A unique field';
                throw new AppError(`The ${field} is already in use. Please use another one.`, 400);
            }
            throw error;
        }
    }

    // Get all hospitals with pagination, search, and soft-delete filtering
    async getAllHospitals(query = {}) {
        const { page = 1, limit = 10, search = '' } = query;
        
        const skip = (page - 1) * parseInt(limit);
        const take = parseInt(limit);
        
        const where = {
            isDeleted: false,
        };

        if (search) {
            where.OR = [
                { hospitalName: { contains: search, mode: 'insensitive' } },
                { hospitalCode: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [hospitals, total] = await Promise.all([
            prisma.hospital.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.hospital.count({ where })
        ]);

        return {
            hospitals,
            meta: {
                total,
                page: parseInt(page),
                limit: take,
                totalPages: Math.ceil(total / take)
            }
        };
    }

    // Get hospital by ID (excluding soft-deleted)
    async getHospitalById(id) {
        const hospital = await prisma.hospital.findFirst({ where: { id, isDeleted: false } });
        if (!hospital) {
            throw new AppError("Hospital not found", 404);
        }
        return hospital;
    }

    // Update hospital
    async updateHospital(id, data) {
        const existingHospital = await prisma.hospital.findFirst({ where: { id, isDeleted: false } });
        if (!existingHospital) {
            throw new AppError("Hospital not found", 404);
        }

        try {
            const updatedHospital = await prisma.hospital.update({
                where: { id },
                data,
            });
            return updatedHospital;
        } catch (error) {
            if (error.code === 'P2002') {
                let target = error.meta?.target || [];
                if (error.meta?.driverAdapterError?.cause?.constraint?.fields) {
                    target = error.meta.driverAdapterError.cause.constraint.fields;
                }
                const field = target[0]?.replace(/["']/g, '') || 'A unique field';
                throw new AppError(`The ${field} is already in use by another hospital.`, 400);
            }
            throw error;
        }
    }

    // Delete hospital (soft delete)
    async deleteHospital(id) {
        const existingHospital = await prisma.hospital.findFirst({ where: { id, isDeleted: false } });
        if (!existingHospital) {
            throw new AppError("Hospital not found", 404);
        }

        const deletedHospital = await prisma.hospital.update({
            where: { id },
            data: { isDeleted: true },
        });

        return deletedHospital;
    }
}
