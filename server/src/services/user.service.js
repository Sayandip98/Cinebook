import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { detectImageType } from '../utils/imageSignature.js';
import * as userRepository from '../repositories/user.repository.js';
import * as uploadService from './upload.service.js';

const AVATAR_FOLDER = 'cinebook/avatars';
const AVATAR_TRANSFORMATION = [
  { width: 400, height: 400, crop: 'fill', gravity: 'face' },
  { quality: 'auto', fetch_format: 'auto' },
];

const requireUser = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  return user;
};

export const getProfile = (userId) => requireUser(userId);

export const updateProfile = async (userId, { name, phone }) => {
  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;

  if (Object.keys(update).length === 0) return requireUser(userId);

  const user = await userRepository.updateById(userId, { $set: update });
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  return user;
};

export const updateAvatar = async (userId, file) => {
  if (!file) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Avatar image is required');
  if (!detectImageType(file.buffer)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'File is not a valid image');
  }

  const user = await requireUser(userId);
  const previousPublicId = user.avatar?.publicId;

  const uploaded = await uploadService.uploadImage(file.buffer, {
    folder: AVATAR_FOLDER,
    transformation: AVATAR_TRANSFORMATION,
  });

  let updatedUser;
  try {
    updatedUser = await userRepository.updateById(userId, { $set: { avatar: uploaded } });
  } catch (error) {
    await uploadService.deleteImage(uploaded.publicId);
    throw error;
  }

  await uploadService.deleteImage(previousPublicId);
  return updatedUser;
};

export const removeAvatar = async (userId) => {
  const user = await requireUser(userId);
  const previousPublicId = user.avatar?.publicId;

  const updatedUser = await userRepository.updateById(userId, { $unset: { avatar: 1 } });
  await uploadService.deleteImage(previousPublicId);
  return updatedUser;
};
