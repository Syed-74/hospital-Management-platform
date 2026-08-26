import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class DepartmentTypeService {
    async createDepartmentType(data) {
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

        const departmentType = await prisma.departmentType.update({
            where: { id },
            data
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
