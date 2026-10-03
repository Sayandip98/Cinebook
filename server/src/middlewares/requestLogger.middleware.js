import { logger } from '../config/logger.js';

export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Math.round(Number(process.hrtime.bigint() - start) / 1e6);
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'http';
    const path = req.originalUrl.split('?')[0];

    logger.log(level, `${req.method} ${path} ${res.statusCode} ${durationMs}ms`, {
      requestId: req.id,
      ip: req.ip,
    });
  });

  next();
};
