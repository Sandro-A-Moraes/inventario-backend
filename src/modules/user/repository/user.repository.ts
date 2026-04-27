import { prisma } from '../../../lib/prisma.js';
import type { createUserData } from '../types/create-user-data.js';

export class UserRepository {
  public async create(data: createUserData) {
    return prisma.user.create({
      data,
      select: { id: true, fullName: true, email: true },
    });
  }

  public async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true },
    });
  }
}
