import mongoose from 'mongoose';
import { COUPON_TYPE, COUPON_TYPE_VALUES } from '../constants/couponType.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{3,20}$/, 'Coupon code must be 3-20 letters, digits, _ or -'],
    },
    description: { type: String, trim: true, maxlength: 200 },
    type: {
      type: String,
      enum: { values: COUPON_TYPE_VALUES, message: 'Invalid coupon type' },
      required: [true, 'Coupon type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Coupon value is required'],
      min: [1, 'Coupon value must be at least 1'],
      validate: {
        validator(value) {
          return this.type !== COUPON_TYPE.PERCENT || value <= 100;
        },
        message: 'A percentage coupon cannot exceed 100',
      },
    },
    maxDiscount: { type: Number, min: [0, 'Max discount cannot be negative'] },
    minOrderAmount: { type: Number, default: 0, min: [0, 'Minimum order cannot be negative'] },
    validFrom: { type: Date, required: [true, 'Valid-from date is required'] },
    validTo: {
      type: Date,
      required: [true, 'Valid-to date is required'],
      validate: {
        validator(value) {
          return !this.validFrom || value > this.validFrom;
        },
        message: 'Valid-to must be after valid-from',
      },
    },
    usageLimit: { type: Number, min: [1, 'Usage limit must be at least 1'] },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: [1, 'Per-user limit must be at least 1'] },
    isActive: { type: Boolean, default: true },
  },
  buildSchemaOptions(),
);

export default mongoose.model('Coupon', couponSchema);
