import { prisma } from "../../config/db.js";

export default class DepartmentService {
    static async createDepartment(data) {
        const department = await prisma.manageDepartment.create({
            data
        });
        return department;
    }

    static async getAllDepartments() {
        const departments = await prisma.manageDepartment.findMany();
        return departments;
    }

    static async getDepartmentById(id) {
        const department = await prisma.manageDepartment.findUnique({
            where: {
                id
            }
        });
        return department;
    }

    static async updateDepartment(id, data) {
        const department = await prisma.manageDepartment.update({
            where: {
                id
            },
            data
        });
        return department;
    }

    static async deleteDepartment(id) {
        const department = await prisma.manageDepartment.delete({
            where: {
                id
            }
        });
        return department;
    }
}
