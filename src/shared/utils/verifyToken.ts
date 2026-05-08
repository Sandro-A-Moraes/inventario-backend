import jwt from 'jsonwebtoken';
import type { AccessTokenPayload } from '../../modules/auth/types/access-token-payload';
import { env } from '../config/env';
import type { RefreshTokenPayload } from '../../modules/auth/types/refresh-token-payload';
import { AppError } from '../errors/AppError';

export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        return jwt.verify(token, env.JWT_SECRET_KEY) as AccessTokenPayload;
    } catch {
        throw new AppError('Invalid or expired token', 401);
    }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        return jwt.verify(token, env.JWT_REFRESH_SECRET_KEY) as RefreshTokenPayload;
    } catch {
        throw new AppError('Invalid or expired token', 401);
    }
}