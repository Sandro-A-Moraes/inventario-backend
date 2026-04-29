export type refreshTokenData = {
    userId: string;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
}