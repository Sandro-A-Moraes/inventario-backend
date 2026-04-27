import { prisma } from '../../../lib/prisma.js';
import type { createUserDTO } from '../dto/user.dto.js';

export class UserRepository {
  async create(data: createUserDTO) {
    return prisma.user.create({
      data,
      select: { id: true, fullName: true, email: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true },
    });
  }
}
