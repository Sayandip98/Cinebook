import mongoose from 'mongoose';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
      unique: true,
    },
    userAgent: { type: String, trim: true },
    ip: { type: String, trim: true },
    expiresAt: { type: Date, required: [true, 'Expiry is required'] },
    revokedAt: Date,
    replacedByTokenHash: String,
  },
  buildSchemaOptions(['tokenHash', 'replacedByTokenHash']),
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
