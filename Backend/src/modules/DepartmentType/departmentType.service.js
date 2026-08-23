import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

class DepartmentTypeService {
    async createDepartmentType(data) {
        const departmentType = await prisma.departmentType.create({
            data
        });
        return departmentType;
    }

    async getAllDepartmentTypes(query) {
        const departmentTypes = await prisma.departmentType.findMany();
        return departmentTypes;
    }

    async getDepartmentTypeById(id) {
        const departmentType = await prisma.departmentType.findUnique({
            where: { id }
        });

        if (!departmentType) {
            throw new AppError("Department Type not found", 404);
        }

        return departmentType;
    }

    async updateDepartmentType(id, data) {
        const existingDepartmentType = await this.getDepartmentTypeById(id);
        if (!existingDepartmentType) {
            throw new AppError("Department Type not found", 404);
        }

        const departmentType = await prisma.departmentType.update({
            where: { id },
            data
        });

        return departmentType;
    }

    async deleteDepartmentType(id) {
        const existingDepartmentType = await this.getDepartmentTypeById(id);
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
