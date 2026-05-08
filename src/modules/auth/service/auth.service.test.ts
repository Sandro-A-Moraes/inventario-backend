import { describe, vi, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import bcrypt from 'bcrypt';
import type { IUserRepository } from '../../user/repository/IUserRepository';
import type { IRefreshTokenRepository } from '../repository/IRefreshTokenRepository';

describe('AuthService', () => {
  let userRepositoryMock: IUserRepository;
  let refreshTokenRepositoryMock: IRefreshTokenRepository;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    userRepositoryMock = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      incrementTokenVersion: vi.fn(),
      create: vi.fn(),
    };

    refreshTokenRepositoryMock = {
      create: vi.fn(),
      findByTokenHash: vi.fn(),
      revokeByTokenHash: vi.fn(),
    };

    authService = new AuthService(
      refreshTokenRepositoryMock,
      userRepositoryMock,
    );
  });

  it('should register user with valid credentials', async () => {
    vi.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPassword');

    vi.mocked(userRepositoryMock.findByEmail).mockResolvedValue(null);

    vi.mocked(userRepositoryMock.create).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      tokenVersion: 0,
    });

    const input = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await authService.register(input);

    expect(result).toEqual({
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      tokenVersion: 0,
    });

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(input.email);

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      fullName: input.fullName,
      email: input.email,
      hashedPassword: 'hashedPassword',
    });
  });
});
