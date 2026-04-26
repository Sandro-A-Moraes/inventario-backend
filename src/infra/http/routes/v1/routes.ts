import { Router } from 'express';

const v1Router = Router();

v1Router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default v1Router;
