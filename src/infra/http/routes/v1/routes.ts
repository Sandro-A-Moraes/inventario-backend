import { Router } from 'express';
import authRoutes from '../../../../modules/auth/routes/auth.routes.js';

const v1Router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API status
 *     description: Returns the current API status, timestamp, and uptime
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is working correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-01T10:00:00.000Z
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                   example: 3600
 */
v1Router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

v1Router.use('/auth', authRoutes);

export default v1Router;
