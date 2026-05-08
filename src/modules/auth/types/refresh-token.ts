export type RefreshToken = {
  id: string;
  jti: string;
  tokenHash: string;
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};
