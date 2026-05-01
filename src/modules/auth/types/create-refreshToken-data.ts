export type RefreshTokenData = {
    userId: string;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
}