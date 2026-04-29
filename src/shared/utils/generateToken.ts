import jwt from 'jsonwebtoken';
import type { AccessTokenPayload } from '../../modules/auth/types/access-token-payload.js';
import type { RefreshTokenPayload } from '../../modules/auth/types/refresh-token-payload.js';

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
    expiresIn: '7d',
  });
}
