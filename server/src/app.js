import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { sanitizeRequest } from './middlewares/sanitize.middleware.js';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { requestId } from './middlewares/requestId.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import routes from './routes/index.js';
import * as paymentController from './controllers/payment.controller.js';

const app = express();

app.disable('x-powered-by');
app.set('query parser', 'simple');

if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.use(requestId);
app.use(requestLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.use(globalLimiter);

app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json', limit: '100kb' }),
  paymentController.handleWebhook,
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(sanitizeRequest);

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
