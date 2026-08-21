import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class FeeService {
    async createFee(data) {
        const fee = await prisma.manageFee.create({
            data
        });
        return fee;
    }

    async getAllFees(query) {
        // You can add logic here to filter or paginate using the 'query' object if needed
        const fees = await prisma.manageFee.findMany();
        return { fees };
    }

    async getFeeById(id) {
        const fee = await prisma.manageFee.findUnique({
            where: { id }
        });
        
        if (!fee) {
            throw new AppError("Fee not found with that ID", 404);
        }
        
        return fee;
    }

    async updateFee(id, data) {
        const fee = await prisma.manageFee.update({
            where: { id },
            data
        });
        return fee;
    }

    async deleteFee(id) {
        await prisma.manageFee.delete({
            where: { id }
        });
        return null;
    }
}

export default FeeService;
