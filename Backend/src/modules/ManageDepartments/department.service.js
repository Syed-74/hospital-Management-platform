import { prisma } from "../../config/db.js";

export default class DepartmentService {
    static async createDepartment(data) {
        try {
            const department = await prisma.manageDepartment.create({
                data
            });
            return department;
        } catch (error) {
            if (error.code === 'P2002') {
                const err = new Error("A department with this code already exists.");
                err.statusCode = 400;
                throw err;
            }
            throw error;
        }
    }

    static async getAllDepartments() {
        const departments = await prisma.manageDepartment.findMany({
            include: {
                departmentType: true
            }
        });
        return departments;
    }

    static async getDepartmentById(id) {
        const department = await prisma.manageDepartment.findUnique({
            where: {
                id
            },
            include: {
                departmentType: true
            }
        });
        return department;
    }

    static async updateDepartment(id, data) {
        try {
            const department = await prisma.manageDepartment.update({
                where: { id },
                data
            });
            return department;
        } catch (error) {
            if (error.code === 'P2002') {
                const err = new Error("A department with this code already exists.");
                err.statusCode = 400;
                throw err;
            }
            throw error;
        }
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
