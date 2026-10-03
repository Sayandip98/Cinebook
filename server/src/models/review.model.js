import mongoose from 'mongoose';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      validate: { validator: Number.isInteger, message: 'Rating must be a whole number' },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment must be at most 1000 characters'],
    },
  },
  buildSchemaOptions(),
);

reviewSchema.index({ user: 1, movie: 1 }, { unique: true });
reviewSchema.index({ movie: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
