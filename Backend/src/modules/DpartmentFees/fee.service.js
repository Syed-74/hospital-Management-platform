import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class FeeService {
    async createFee(data) {
        const fee = await prisma.manageFee.create({
            data
        });
        return fee;
    }

    async getAllFees(user, query) {
        let whereClause = {};
        if (user?.branchAdmin?.branchId) {
            whereClause.hospitalId = user.branchAdmin.hospitalId;
            whereClause.branchId = user.branchAdmin.branchId;
        } else if (user?.hospitalId) {
            whereClause.hospitalId = user.hospitalId;
            if (query?.branchId) whereClause.branchId = query.branchId;
        } else {
            if (query?.hospitalId) whereClause.hospitalId = query.hospitalId;
            if (query?.branchId) whereClause.branchId = query.branchId;
        }

        const fees = await prisma.manageFee.findMany({ where: whereClause });
        return { fees };
    }

    async getFeeById(id, user) {
        let whereClause = { id };
        if (user?.branchAdmin?.branchId) {
            whereClause.hospitalId = user.branchAdmin.hospitalId;
            whereClause.branchId = user.branchAdmin.branchId;
        } else if (user?.hospitalId) {
            whereClause.hospitalId = user.hospitalId;
        }

        const fee = await prisma.manageFee.findFirst({
            where: whereClause
        });
        
        if (!fee) {
            throw new AppError("Fee not found with that ID", 404);
        }
        
        return fee;
    }

    async updateFee(id, data, user) {
        const existingFee = await this.getFeeById(id, user);
        
        const fee = await prisma.manageFee.update({
            where: { id },
            data
        });
        return fee;
    }

    async deleteFee(id, user) {
        const existingFee = await this.getFeeById(id, user);

        await prisma.manageFee.delete({
            where: { id }
        });
        return null;
    }
}

export default FeeService;
