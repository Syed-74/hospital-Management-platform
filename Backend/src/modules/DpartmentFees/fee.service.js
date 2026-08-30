import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class FeeService {
    // Both the branch and the department a fee is being attached to must
    // actually belong to the hospital (and, for the department, the same
    // branch) the fee is being scoped to — client-supplied ids are inputs
    // to verify, not facts to trust.
    async _assertScopeIsConsistent(hospitalId, branchId, departmentId) {
        if (hospitalId && branchId) {
            const branch = await prisma.branchManage.findUnique({ where: { id: branchId } });
            if (!branch) throw new AppError("Branch not found.", 404);
            if (branch.hospitalId !== hospitalId) {
                throw new AppError("This branch does not belong to the specified hospital.", 400);
            }
        }
        if (departmentId && (hospitalId || branchId)) {
            const department = await prisma.manageDepartment.findUnique({ where: { id: departmentId } });
            if (!department) throw new AppError("Department not found.", 404);
            if (department.hospitalId !== hospitalId || department.branchId !== branchId) {
                throw new AppError("This department does not belong to the specified hospital/branch.", 400);
            }
        }
    }

    async createFee(data) {
        await this._assertScopeIsConsistent(data.hospitalId, data.branchId, data.departmentId);

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

        const { hospitalId, ...safeData } = data;
        if (safeData.branchId || safeData.departmentId) {
            await this._assertScopeIsConsistent(
                existingFee.hospitalId,
                safeData.branchId || existingFee.branchId,
                safeData.departmentId || existingFee.departmentId
            );
        }

        const fee = await prisma.manageFee.update({
            where: { id },
            data: safeData
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
