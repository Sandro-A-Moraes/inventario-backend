import { AuthService } from "../service/auth.service.js";
import type { Request, Response } from "express";

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public register = async (req: Request, res: Response) => {
            const user = await this.authService.register(req.body);
            res.status(201).json({user});
        
    }

    public login = async (req: Request, res: Response) => {
            const authResponse = await this.authService.login(req.body);
            res.json({authResponse});
    }

    public logout = async (req: Request, res: Response) => {
            const { refreshToken } = req.body;
            await this.authService.logout(refreshToken);
            res.status(204).json({success: true});
    }

    
}