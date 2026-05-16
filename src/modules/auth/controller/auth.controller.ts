import type { AuthenticatedRequest } from "../../../shared/types/authenticated-request";
import { AuthService } from "../service/auth.service";
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
        try {
            const authResponse = await this.authService.login(req.body);

            res.cookie('accessToken', authResponse.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', authResponse.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.status(200).json({authResponse});
        } catch (error: unknown) {
            if (error instanceof Error) {
              res.status(401).json({ message: error.message });
            } else {
              res.status(400).json({ message: 'Unknown error' });
            }
        }
    }

    public logout = async (req: Request, res: Response) => {
            const { refreshToken } = req.body;
            await this.authService.logout(refreshToken);
            res.status(204).json({success: true});
    }

    public refresh = async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const authResponse = await this.authService.refresh(refreshToken);
        res.status(200).json({authResponse});
    }

    public me = async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await this.authService.me(userId);
        res.json({user});
    }
}