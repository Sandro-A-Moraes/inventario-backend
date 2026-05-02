import type { User } from "../../user/types/user";

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
