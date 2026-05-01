import { prisma } from '../../../lib/prisma.js';
import type { RefreshTokenData } from '../types/create-refreshToken-data.js';

export class RefreshTokenRepository {
  public async create(data: RefreshTokenData) {
    return prisma.refreshToken.create({ data });
  }

  public async findByTokenHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  public async revokeByTokenHash(tokenHash: string) {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revokedAt: new Date(),
      },
    });
  }

}
