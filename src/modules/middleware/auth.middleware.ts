import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/authenticated-request';
import { verifyAccessToken } from '../../shared/utils/verifyToken';


export class AuthMiddleware {
    public authenticate (req: AuthenticatedRequest, res: Response, next: NextFunction)  {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        const[schema, token] = authHeader.split(' ');
        if (schema !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Invalid authorization format' });
        }

        const decodedToken = verifyAccessToken(token);
        req.userId = decodedToken.sub;
        return next();
    }
}