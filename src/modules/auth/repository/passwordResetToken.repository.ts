import { prisma } from '../../../lib/prisma';
import type { IPasswordResetTokenRepository } from './IPasswordResetTokenRepository';
import type { PasswordResetToken } from '../types/password-reset-token';


export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
    public async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<PasswordResetToken> {
        return prisma.passwordResetToken.create({ data });
    }

    public async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
        return prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });
    }

    public async markAsUsed(tokenHash: string): Promise<void> {
        await prisma.passwordResetToken.update({
            where: { tokenHash },
            data: {
                usedAt: new Date(),
            },
        });
    }

    public async deleteByUserId(userId: string): Promise<void> {
        await prisma.passwordResetToken.deleteMany({
            where: { userId },
        });
    }
}