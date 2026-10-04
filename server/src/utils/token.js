import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const JWT_ALGORITHM = 'HS256';

export const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.JWT_ACCESS_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: [JWT_ALGORITHM] });

export const generateOpaqueToken = () => crypto.randomBytes(40).toString('hex');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
