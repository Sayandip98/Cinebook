import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { REFRESH_COOKIE_NAME, clearRefreshCookie, setRefreshCookie } from '../utils/cookie.js';
import * as authService from '../services/auth.service.js';

const getMeta = (req) => ({ userAgent: req.get('User-Agent'), ip: req.ip });
const getRefreshCookie = (req) => req.cookies?.[REFRESH_COOKIE_NAME];

const GENERIC_EMAIL_MESSAGE =
  'If an account exists for that email, we have sent instructions to it.';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.validated.body);
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Registration successful. Please check your email to verify your account.',
    data: { user },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.validated.body,
    getMeta(req),
  );
  setRefreshCookie(res, refreshToken);
  ApiResponse.send(res, { message: 'Login successful', data: { user, accessToken } });
});

export const refreshToken = asyncHandler(async (req, res) => {
  try {
    const {
      user,
      accessToken,
      refreshToken: newToken,
    } = await authService.refresh(getRefreshCookie(req), getMeta(req));
    setRefreshCookie(res, newToken);
    ApiResponse.send(res, { message: 'Token refreshed', data: { user, accessToken } });
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(getRefreshCookie(req));
  clearRefreshCookie(res);
  ApiResponse.send(res, { message: 'Logged out' });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user._id);
  clearRefreshCookie(res);
  ApiResponse.send(res, { message: 'Logged out from all devices' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.validated.body.token);
  ApiResponse.send(res, { message: 'Email verified successfully' });
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.validated.body.email);
  ApiResponse.send(res, { message: GENERIC_EMAIL_MESSAGE });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.validated.body.email);
  ApiResponse.send(res, { message: GENERIC_EMAIL_MESSAGE });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.validated.body;
  await authService.resetPassword(token, password);
  clearRefreshCookie(res);
  ApiResponse.send(res, { message: 'Password reset successful. Please log in.' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const {
    user,
    accessToken,
    refreshToken: newToken,
  } = await authService.changePassword(req.user._id, req.validated.body, getMeta(req));
  setRefreshCookie(res, newToken);
  ApiResponse.send(res, { message: 'Password changed successfully', data: { user, accessToken } });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  ApiResponse.send(res, { data: { user } });
});

export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.listSessions(req.user._id, getRefreshCookie(req));
  ApiResponse.send(res, { data: { sessions } });
});

export const revokeSession = asyncHandler(async (req, res) => {
  await authService.revokeSession(req.user._id, req.validated.params.id);
  ApiResponse.send(res, { message: 'Session revoked' });
});