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

    static async getAllDepartments(user, query) {
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

        const departments = await prisma.manageDepartment.findMany({
            where: whereClause,
            include: {
                departmentType: true
            }
        });
        return departments;
    }

    static async getDepartmentById(id, user) {
        let whereClause = { id };
        if (user?.branchAdmin?.branchId) {
            whereClause.hospitalId = user.branchAdmin.hospitalId;
            whereClause.branchId = user.branchAdmin.branchId;
        } else if (user?.hospitalId) {
            whereClause.hospitalId = user.hospitalId;
        }

        const department = await prisma.manageDepartment.findFirst({
            where: whereClause,
            include: {
                departmentType: true
            }
        });
        return department;
    }

    static async updateDepartment(id, data, user) {
        try {
            const existingDepartment = await this.getDepartmentById(id, user);
            if (!existingDepartment) {
                const err = new Error("Department not found");
                err.statusCode = 404;
                throw err;
            }

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

    static async deleteDepartment(id, user) {
        const existingDepartment = await this.getDepartmentById(id, user);
        if (!existingDepartment) {
            const err = new Error("Department not found");
            err.statusCode = 404;
            throw err;
        }

        const department = await prisma.manageDepartment.delete({
            where: {
                id
            }
        });
        return department;
    }
}
