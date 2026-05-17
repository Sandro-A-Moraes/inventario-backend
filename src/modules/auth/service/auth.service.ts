import type { IUserRepository } from '../../user/repository/IUserRepository';
import type { IRefreshTokenRepository } from '../repository/IRefreshTokenRepository';
import type { IPasswordResetTokenRepository } from '../repository/IPasswordResetTokenRepository';
import type { RegisterData } from '../types/register-data';
import { validateEmail } from '../../../shared/utils/validateEmail';
import bcrypt from 'bcrypt';
import type { LoginData } from '../types/login-data';
import type { User } from '../../user/types/user';
import type { AuthResponse } from '../types/auth-response';
import {
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
} from '../../../shared/utils/generateToken';
import { generateRandomJTI, hashToken } from '../../../shared/utils/hashToken';
import { AppError } from '../../../shared/errors/AppError';

const REFRESH_TOKEN_EXPIRATION_DAYS = 7;
const REFRESH_TOKEN_EXPIRATION_MILLISECONDS =
  REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRATION_MINUTES = 60;
const message =
  'If an account with that email exists, a password reset link has been sent.';

const PASSWORD_RESET_EXPIRATION_MS =
  PASSWORD_RESET_EXPIRATION_MINUTES * 60 * 1000;

export class AuthService {
  private refreshTokenRepository: IRefreshTokenRepository;
  private userRepository: IUserRepository;
  private passwordResetTokenRepository: IPasswordResetTokenRepository;

  constructor(
    refreshTokenRepository: IRefreshTokenRepository,
    userRepository: IUserRepository,
    passwordResetTokenRepository: IPasswordResetTokenRepository,
  ) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.userRepository = userRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
  }

  public async register(data: RegisterData): Promise<User> {
    const { password, ...userData } = data;

    if (!validateEmail(userData.email)) {
      throw new AppError('Invalid email format', 400);
    }

    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.userRepository.create({
      ...userData,
      hashedPassword,
    });
  }

  public async login(data: LoginData): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (!existingUser) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      existingUser.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const jti = generateRandomJTI();

    const refreshToken = generateRefreshToken({ sub: existingUser.id, jti });

    const tokenHash = hashToken(refreshToken);

    const accessToken = generateAccessToken({
      sub: existingUser.id,
      email: existingUser.email,
      tokenVersion: existingUser.tokenVersion,
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
      tokenVersion: existingUser.tokenVersion,
    };

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  public async forgotPassword(
    email: string,
  ): Promise<{ message: string; resetToken?: string }> {
    const user = await this.userRepository.findByEmail(email);
    

    if (!user) {
      return { message };
    }

    await this.passwordResetTokenRepository.deleteByUserId(user.id);

    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MS);

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return { message, resetToken: token };
  }

  public async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const existingToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!existingToken) {
      throw new AppError('Invalid or expired token', 401);
    }

    if (existingToken.revokedAt) {
      throw new AppError('Token already revoked', 401);
    }

    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);

    await this.userRepository.incrementTokenVersion(existingToken.userId);

    return { success: true };
  }

  public async refresh(refreshToken: string): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const tokenHash = hashToken(refreshToken);
    const existingToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (
      !existingToken ||
      existingToken.revokedAt ||
      existingToken.expiresAt < new Date()
    ) {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await this.userRepository.findById(existingToken.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newJTI = generateRandomJTI();

    const newRefreshToken = generateRefreshToken({ sub: user.id, jti: newJTI });

    const newAccessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    const newTokenHash = hashToken(newRefreshToken);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokenHash,
      jti: newJTI,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MILLISECONDS),
    });

    const safeUser: User = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      tokenVersion: user.tokenVersion,
    };

    return {
      user: safeUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async me(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
