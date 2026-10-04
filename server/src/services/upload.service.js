import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const assertConfigured = () => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Image uploads are not configured');
  }
};

export const uploadImage = (buffer, { folder, transformation }) => {
  assertConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary upload failed', { error: error?.message });
          return reject(new ApiError(502, 'Image upload failed. Please try again.'));
        }
        return resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Cloudinary delete failed', { publicId, error: error.message });
  }
};
