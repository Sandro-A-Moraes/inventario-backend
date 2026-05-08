import { prisma } from '../../../lib/prisma';
import type { RefreshTokenData } from '../types/create-refreshToken-data';
import type { IRefreshTokenRepository } from './IRefreshTokenRepository';
import type { RefreshToken } from '../types/refresh-token';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  public async create(data: RefreshTokenData): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  public async findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  public async revokeByTokenHash(tokenHash: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
