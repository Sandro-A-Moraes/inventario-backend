export type UserWithPassword = {
  id: string;
  fullName: string;
  email: string;
  hashedPassword: string;
  tokenVersion: number;
};
