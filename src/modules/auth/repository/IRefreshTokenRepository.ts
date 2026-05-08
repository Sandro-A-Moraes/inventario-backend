import type { RefreshTokenData } from '../types/create-refreshToken-data';
import type { RefreshToken } from '../types/refresh-token';

export interface IRefreshTokenRepository {
  create(data: RefreshTokenData): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeByTokenHash(tokenHash: string): Promise<RefreshToken>;
}
