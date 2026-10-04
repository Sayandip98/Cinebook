import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  ApiResponse.send(res, { data: { user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.validated.body);
  ApiResponse.send(res, { message: 'Profile updated', data: { user } });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user._id, req.file);
  ApiResponse.send(res, { message: 'Avatar updated', data: { user } });
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await userService.removeAvatar(req.user._id);
  ApiResponse.send(res, { message: 'Avatar removed', data: { user } });
});
