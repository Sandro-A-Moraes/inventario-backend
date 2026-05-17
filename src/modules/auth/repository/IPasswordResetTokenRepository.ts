import type { PasswordResetToken } from '../types/password-reset-token';

export interface IPasswordResetTokenRepository {
  create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken>;

  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;

  markAsUsed(tokenHash: string): Promise<void>;

  deleteByUserId(userId: string): Promise<void>;

  revokeActiveTokensByUserId(userId: string): Promise<void>;
}