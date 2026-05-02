import jwt from 'jsonwebtoken';
import type { AccessTokenPayload } from '../../modules/auth/types/access-token-payload';
import type { RefreshTokenPayload } from '../../modules/auth/types/refresh-token-payload';
import { env } from '../config/env';

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET_KEY, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: '7d',
  });
}
