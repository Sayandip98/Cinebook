// import { env } from './env.js';
// import { ApiError } from '../utils/ApiError.js';

// const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

// export const corsOptions = {
//   origin(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new ApiError(403, 'Origin not allowed by CORS'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };


import { env } from './env.js';
import { logger } from './logger.js';
import { ApiError } from '../utils/ApiError.js';

const normalize = (origin) => origin.trim().replace(/\/+$/, '');

const allowedOrigins = env.CLIENT_URL.split(',').map(normalize);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn('CORS rejected origin', { origin, allowedOrigins });
    return callback(new ApiError(403, 'Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};