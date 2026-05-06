import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/authenticated-request';
import { verifyAccessToken } from '../../shared/utils/verifyToken';
import { prisma } from '../../lib/prisma';


export class AuthMiddleware {
    public async authenticate (req: AuthenticatedRequest, res: Response, next: NextFunction)  {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        const[schema, token] = authHeader.split(' ');
        if (schema !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Invalid authorization format' });
        }

        const decodedToken = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.sub },
            select: { tokenVersion: true },
        });

        if(!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if(user.tokenVersion !== decodedToken.tokenVersion) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.userId = decodedToken.sub;
        return next();
    }
}