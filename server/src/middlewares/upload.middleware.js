import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const POSTER_MAX_BYTES = 5 * 1024 * 1024;

const imageFileFilter = (_req, file, callback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) return callback(null, true);
  return callback(
    new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only JPG, PNG and WebP images are allowed'),
  );
};

const createImageUpload = (maxBytes) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: imageFileFilter,
  });

export const uploadAvatar = createImageUpload(AVATAR_MAX_BYTES).single('avatar');

export const uploadPoster = createImageUpload(POSTER_MAX_BYTES).single('poster');