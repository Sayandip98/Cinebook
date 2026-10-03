import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { MOVIE_STATUS, MOVIE_STATUS_VALUES } from '../constants/movieStatus.js';
import { MOVIE_CERTIFICATE_VALUES } from '../constants/movieCertificate.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const nonEmptyArray = {
  validator: (value) => Array.isArray(value) && value.length > 0,
  message: '{PATH} must contain at least one item',
};

const imageSchema = { url: String, publicId: String };

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },
    genres: { type: [{ type: String, trim: true }], validate: nonEmptyArray },
    languages: { type: [{ type: String, trim: true }], validate: nonEmptyArray },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: { type: Date, required: [true, 'Release date is required'] },
    certificate: {
      type: String,
      enum: { values: MOVIE_CERTIFICATE_VALUES, message: 'Invalid certificate' },
      required: [true, 'Certificate is required'],
    },
    director: { type: String, trim: true },
    cast: [
      {
        _id: false,
        name: { type: String, required: [true, 'Cast member name is required'], trim: true },
        role: { type: String, trim: true },
      },
    ],
    poster: imageSchema,
    banner: imageSchema,
    trailerUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: { values: MOVIE_STATUS_VALUES, message: 'Invalid movie status' },
      default: MOVIE_STATUS.UPCOMING,
    },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  buildSchemaOptions(),
);

movieSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 10, description: 1 } },
);
movieSchema.index({ status: 1, releaseDate: -1 });

movieSchema.pre('validate', async function () {
  if (!this.title) return;
  if (this.slug && !this.isModified('title')) return;

  const baseSlug = slugify(this.title, { lower: true, strict: true });
  let candidate = baseSlug;

  while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${baseSlug}-${randomBytes(2).toString('hex')}`;
  }
  this.slug = candidate;
});

export default mongoose.model('Movie', movieSchema);
