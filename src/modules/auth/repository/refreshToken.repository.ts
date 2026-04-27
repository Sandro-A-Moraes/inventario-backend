import {prisma} from '../../../lib/prisma.js'
import type { refreshTokenData } from '../types/create-refreshToken-data.js';

export class refreshTokenRepository {
    public async create(data: refreshTokenData) {
        return prisma.refreshToken.create({ data });
    }

    public async findByTokenHash(tokenHash: string) {
        return prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
    }
    
    public async revokeByTokenHash(tokenHash: string) {
        return prisma.refreshToken.delete({
            where: { tokenHash },
        });
    }
}