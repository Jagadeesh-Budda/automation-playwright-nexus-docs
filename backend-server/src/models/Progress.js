const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Progress {
    static async findOne(query) {
        const result = await prisma.progress.findFirst({ where: query });
        if (result && typeof result.state === 'string') {
            try {
                result.state = JSON.parse(result.state);
            } catch(e) {}
        }
        return result;
    }
    
    static async findOneAndUpdate(query, update, options) {
        const stateData = update.$set ? update.$set.state : update.state;
        const stateStr = typeof stateData === 'string' ? stateData : JSON.stringify(stateData || {});
        
        let progress = await prisma.progress.findFirst({ where: query });
        
        if (!progress && options && options.upsert) {
            const created = await prisma.progress.create({
                data: {
                    userId: query.userId,
                    state: stateStr
                }
            });
            try { created.state = JSON.parse(created.state); } catch(e) {}
            return created;
        }
        
        if (progress) {
            const updated = await prisma.progress.update({
                where: { id: progress.id },
                data: { state: stateStr }
            });
            try { updated.state = JSON.parse(updated.state); } catch(e) {}
            return updated;
        }
        return null;
    }
}

module.exports = Progress;
