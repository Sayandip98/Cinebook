import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const PARTS = ['body', 'query', 'params'];

export const validate = (schemas) => (req, _res, next) => {
  const validated = { body: {}, query: {}, params: {} };
  const errors = [];

  for (const part of PARTS) {
    const schema = schemas[part];
    if (!schema) continue;

    const { error, value } = schema.validate(req[part] ?? {}, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      errors.push(
        ...error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
        })),
      );
    } else {
      validated[part] = value;
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors));
  }

  req.validated = validated;
  return next();
};
