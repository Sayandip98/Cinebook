import { Router } from 'express';
import { env } from '../config/env.js';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import movieRoutes from './movie.routes.js';
import theaterRoutes from './theater.routes.js';
import screenRoutes from './screen.routes.js';
import showRoutes from './show.routes.js';
import bookingRoutes from './booking.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/movies', movieRoutes);
router.use('/theaters', theaterRoutes);
router.use('/screens', screenRoutes);
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);

if (!env.isProduction) {
  router.get('/_debug/error', () => {
    throw new Error('Deliberate test error');
  });
}

export default router;
