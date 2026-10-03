import { Router } from 'express';
import { env } from '../config/env.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);

if (!env.isProduction) {
  router.get('/_debug/error', () => {
    throw new Error('Deliberate test error');
  });
}

export default router;
