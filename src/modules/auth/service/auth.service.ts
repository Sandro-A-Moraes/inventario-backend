import type { UserRepository } from "../../user/repository/user.repository.js";
import { refreshTokenRepository } from "../repository/refreshToken.repository.js";
import type { RegisterData } from "../types/register-data.js";
import { validateEmail } from "../../../shared/utils/validateEmail.js";
import bcrypt from 'bcrypt';
// import type { LoginData } from "../types/login-data.js";
import type { User } from "../../user/types/user.js";
// import type { AuthResponse } from "../types/auth-response.js";

export class AuthService {
    private refreshTokenRepository: refreshTokenRepository;
    private userRepository: UserRepository;

    constructor(refreshTokenRepository: refreshTokenRepository, userRepository: UserRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public async register(data: RegisterData): Promise<User> {
        if (!validateEmail(data.email)) {
            throw new Error('Invalid email format');
        }

        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        return this.userRepository.create({
            ...data,
            hashedPassword
        });
    }

    // public async login (data: LoginData): Promise<AuthResponse> {
    //     const existingUser = await this.userRepository.findByEmail(data.email)

    //     if(!existingUser){
    //         throw new Error('Email not registered')
    //     }
        
    //     const isPasswordValid = await bcrypt.compare(data.password, existingUser.hashedPassword)

    //     if(!isPasswordValid){
    //         throw new Error('Incorrect Password')
    //     }
    // }
}