import { prisma } from '../../../lib/prisma';
import type { createUserData } from '../types/create-user-data';
import type { UserWithPassword } from '../types/user-with-password';
import type { User } from '../types/user';

export class UserRepository {
  public async create(data: createUserData): Promise<User> {
    return prisma.user.create({
      data,
      select: { id: true, fullName: true, email: true, tokenVersion: true },
    });
  }

  public async findByEmail(email: string): Promise<UserWithPassword | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async findById(id: string): Promise <User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, tokenVersion: true },
    });
  }

  public async incrementTokenVersion(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });
  }

}
