import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class DepartmentTypeService {
    // A Hospital Admin's branchId comes straight from the request body — it
    // must be verified to actually belong to the hospital being scoped to.
    async _assertBranchBelongsToHospital(hospitalId, branchId) {
        if (!hospitalId || !branchId) return;
        const branch = await prisma.branchManage.findUnique({ where: { id: branchId } });
        if (!branch) throw new AppError("Branch not found.", 404);
        if (branch.hospitalId !== hospitalId) {
            throw new AppError("This branch does not belong to the specified hospital.", 400);
        }
    }

    async createDepartmentType(data) {
        await this._assertBranchBelongsToHospital(data.hospitalId, data.branchId);

        const departmentType = await prisma.departmentType.create({
            data
        });
        return departmentType;
    }

    async getAllDepartmentTypes(user, query) {
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

        const departmentTypes = await prisma.departmentType.findMany({ where: whereClause });
        return departmentTypes;
    }

    async getDepartmentTypeById(id, user) {
        let whereClause = { id };
        if (user?.branchAdmin?.branchId) {
            whereClause.hospitalId = user.branchAdmin.hospitalId;
            whereClause.branchId = user.branchAdmin.branchId;
        } else if (user?.hospitalId) {
            whereClause.hospitalId = user.hospitalId;
        }

        const departmentType = await prisma.departmentType.findFirst({
            where: whereClause
        });

        if (!departmentType) {
            throw new AppError("Department Type not found", 404);
        }

        return departmentType;
    }

    async updateDepartmentType(id, data, user) {
        const existingDepartmentType = await this.getDepartmentTypeById(id, user);
        if (!existingDepartmentType) {
            throw new AppError("Department Type not found", 404);
        }

        const { hospitalId, ...safeData } = data;
        if (safeData.branchId) {
            await this._assertBranchBelongsToHospital(existingDepartmentType.hospitalId, safeData.branchId);
        }

        const departmentType = await prisma.departmentType.update({
            where: { id },
            data: safeData
        });

        return departmentType;
    }

    async deleteDepartmentType(id, user) {
        const existingDepartmentType = await this.getDepartmentTypeById(id, user);
        if (!existingDepartmentType) {
            throw new AppError("Department Type not found", 404);
        }

        const departmentType = await prisma.departmentType.delete({
            where: { id }
        });

        return departmentType;
    }
}

export default new DepartmentTypeService();
