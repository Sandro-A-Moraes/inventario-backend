import { Router } from "express";
import { RefreshTokenRepository } from "../repository/refreshToken.repository";
import { UserRepository } from "../../user/repository/user.repository";
import { AuthController} from "../controller/auth.controller";
import { AuthService } from "../service/auth.service.js";


const authRoutes = Router();
const refreshTokenRepository = new RefreshTokenRepository();
const userRepository = new UserRepository();
const authService = new AuthService(refreshTokenRepository, userRepository);
const authController = new AuthController(authService);

authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.post('/refresh', authController.refresh);
authRoutes.get('/me', authController.me);

export default authRoutes;