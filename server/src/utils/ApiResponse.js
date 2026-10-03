import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ApiResponse {
  static send(res, { statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta } = {}) {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }
}
