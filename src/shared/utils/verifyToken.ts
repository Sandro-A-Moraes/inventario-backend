import jwt from 'jsonwebtoken';
import type { AccessTokenPayload } from '../../modules/auth/types/access-token-payload';
import { env } from '../config/env';
import type { RefreshTokenPayload } from '../../modules/auth/types/refresh-token-payload';

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_SECRET_KEY) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET_KEY) as RefreshTokenPayload;
}