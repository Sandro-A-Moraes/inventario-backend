import type { User } from "../../user/types/user.js";

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
