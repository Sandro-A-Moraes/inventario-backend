import type { UserRepository } from "../../user/repository/user.repository";
import { refreshTokenRepository } from "../repository/refreshToken.repository.js";

export class AuthService {
    private refreshTokenRepository: refreshTokenRepository;
    private userRepository: UserRepository;

    constructor(refreshTokenRepository: refreshTokenRepository, userRepository: UserRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    //TODO: Implement authentication logic, such as generating access tokens, validating refresh tokens, etc.
}