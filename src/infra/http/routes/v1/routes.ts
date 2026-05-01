import { Router } from 'express';
import authRoutes from '../../../../modules/auth/routes/auth.routes.js';

const v1Router = Router();


v1Router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

v1Router.use('/auth', authRoutes);

export default v1Router;
