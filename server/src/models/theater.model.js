import mongoose from 'mongoose';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const isValidCoordinates = ([longitude, latitude] = []) =>
  Number.isFinite(longitude) &&
  Number.isFinite(latitude) &&
  longitude >= -180 &&
  longitude <= 180 &&
  latitude >= -90 &&
  latitude <= 90;

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
      maxlength: [120, 'Theater name must be at most 120 characters'],
    },
    city: { type: String, required: [true, 'City is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    pincode: { type: String, trim: true, match: [/^\d{6}$/, 'Pincode must be 6 digits'] },
    location: {
      type: { type: String, enum: ['Point'], required: [true, 'Location type is required'] },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
        validate: {
          validator: (value) => value.length === 2 && isValidCoordinates(value),
          message: 'Coordinates must be [longitude, latitude] within valid ranges',
        },
      },
    },
    amenities: [{ type: String, trim: true }],
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  buildSchemaOptions(),
);

theaterSchema.index({ location: '2dsphere' });
theaterSchema.index({ city: 1 });
theaterSchema.index({ manager: 1 });

export default mongoose.model('Theater', theaterSchema);
