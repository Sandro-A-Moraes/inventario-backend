import { prisma } from '../../../lib/prisma.js';
import type { createUserData } from '../types/create-user-data.js';
import type { UserWithPassword } from '../types/user-with-password.js';
import type { User } from '../types/user.js';

export class UserRepository {
  public async create(data: createUserData): Promise<User> {
    return prisma.user.create({
      data,
      select: { id: true, fullName: true, email: true },
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
      select: { id: true, fullName: true, email: true },
    });
  }
}
