import {prisma} from '../../../lib/prisma.js'
import type { refreshTokenData } from '../types/create-refreshToken-data.js';

export class refreshTokenRepository {
    async create(data: refreshTokenData) {
        return prisma.refreshToken.create({ data });
    }

    async findByTokenHash(tokenHash: string) {
        return prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
    }
    
    async revokeByTokenHash(tokenHash: string) {
        return prisma.refreshToken.delete({
            where: { tokenHash },
        });
    }
}