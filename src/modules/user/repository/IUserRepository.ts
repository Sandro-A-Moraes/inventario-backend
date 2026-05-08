import type { createUserData } from '../types/create-user-data';
import type { UserWithPassword } from '../types/user-with-password';
import type { User } from '../types/user';

export interface IUserRepository {
  create(data: createUserData): Promise<User>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<User | null>;
  incrementTokenVersion(userId: string): Promise<void>;
}
