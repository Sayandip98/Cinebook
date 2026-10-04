import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'refreshToken';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const baseOptions = {
  httpOnly: true,
  secure: env.isProduction || env.COOKIE_SAME_SITE === 'none',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/v1/auth',
};

export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions,
    maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * MS_PER_DAY,
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions);
};
