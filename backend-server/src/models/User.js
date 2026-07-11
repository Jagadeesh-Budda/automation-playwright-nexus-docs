const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class User {
    static async findOne(query) {
        return prisma.user.findFirst({ where: query });
    }
    
    static async create(data) {
        return prisma.user.create({ data });
    }
    
    static async findByIdAndUpdate(id, data, options) {
        // Strip out MongoDB operators if any
        const updateData = data.$set ? data.$set : data;
        return prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    static async updateOne(query, data) {
        const updateData = data.$set ? data.$set : data;
        return prisma.user.updateMany({
            where: query,
            data: updateData
        });
    }
}

module.exports = User;
