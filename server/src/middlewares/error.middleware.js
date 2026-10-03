import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    return new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors);
  }

  if (err.name === 'CastError') {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid value for "${err.path}"`);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const errors = fields.map((field) => ({ field, message: `${field} already exists` }));
    const message = fields.length ? `${fields.join(', ')} already exists` : 'Duplicate value';
    return new ApiError(HTTP_STATUS.CONFLICT, message, errors);
  }

  if (err.name === 'TokenExpiredError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token expired');
  }

  if (err.name === 'JsonWebTokenError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
  }

  if (err.name === 'MulterError') {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, err.message);
  }

  if (err.type === 'entity.parse.failed') {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, 'Malformed JSON in request body');
  }

  if (err.type === 'entity.too.large') {
    return new ApiError(HTTP_STATUS.PAYLOAD_TOO_LARGE, 'Request body too large');
  }

  const message = env.isProduction ? 'Internal server error' : err.message;
  return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, [], false);
};

export const errorHandler = (err, req, res, _next) => {
  const apiError = normalizeError(err);
  const logMeta = { requestId: req.id, method: req.method, path: req.originalUrl.split('?')[0] };

  if (apiError.statusCode >= 500) {
    logger.error(err.message, { ...logMeta, stack: err.stack });
  } else {
    logger.warn(apiError.message, { ...logMeta, statusCode: apiError.statusCode });
  }

  const body = {
    success: false,
    message: apiError.message,
    errors: apiError.errors,
    requestId: req.id,
  };

  if (!env.isProduction && !apiError.isOperational) {
    body.stack = err.stack;
  }

  res.status(apiError.statusCode).json(body);
};
