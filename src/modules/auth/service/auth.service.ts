import { UserRepository } from '../../user/repository/user.repository.js';
import { RefreshTokenRepository } from '../repository/refreshToken.repository.js';
import type { RegisterData } from '../types/register-data.js';
import { validateEmail } from '../../../shared/utils/validateEmail.js';
import bcrypt from 'bcrypt';
import type { LoginData } from '../types/login-data.js';
import type { User } from '../../user/types/user.js';
import type { AuthResponse } from '../types/auth-response.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../../shared/utils/generateToken.js';
import {
  generateRandomJTI,
  hashToken,
} from '../../../shared/utils/hashToken.js';

const REFRESH_TOKEN_EXPIRATION_DAYS = 7;
const REFRESH_TOKEN_EXPIRATION_MILLISECONDS =
  REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export class AuthService {
  private refreshTokenRepository: RefreshTokenRepository;
  private userRepository: UserRepository;

  constructor(
    refreshTokenRepository: RefreshTokenRepository,
    userRepository: UserRepository,
  ) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.userRepository = userRepository;
  }

  public async register(data: RegisterData): Promise<User> {
    if (!validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.userRepository.create({
      ...data,
      hashedPassword,
    });
  }

  public async login(data: LoginData): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (!existingUser) {
      throw new Error('Email not registered');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      existingUser.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new Error('Incorrect Password');
    }

    const jti = generateRandomJTI();

    const refreshToken = generateRefreshToken({ sub: existingUser.id, jti });

    const tokenHash = hashToken(refreshToken);

    const accessToken = generateAccessToken({
      sub: existingUser.id,
      email: existingUser.email,
    });

    await this.refreshTokenRepository.create({
      userId: existingUser.id,
      tokenHash,
      jti,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MILLISECONDS),
    });

    const safeUser: User = {
      id: existingUser.id,
      fullName: existingUser.fullName,
      email: existingUser.email,
    };

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  public async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const existingToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!existingToken) {
      throw new Error('Invalid or expired token');
    }

    if (existingToken.revokedAt) {
      throw new Error('Token already revoked');
    }

    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);

    return { success: 'ok' };
  }
}
