import mongoose from 'mongoose';
import { SCREEN_TYPE, SCREEN_TYPE_VALUES } from '../constants/screenType.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const SEAT_LABEL_PATTERN = /^[A-Z]\d{1,2}$/;

function validateCategories(categories) {
  const totalRows = this.seatLayout?.rows;
  if (!totalRows || !Array.isArray(categories) || categories.length === 0) return false;

  const sorted = [...categories].sort((a, b) => a.fromRow - b.fromRow);
  let previousEnd = 0;

  for (const category of sorted) {
    const isValidRange =
      Number.isInteger(category.fromRow) &&
      Number.isInteger(category.toRow) &&
      category.fromRow >= 1 &&
      category.toRow >= category.fromRow &&
      category.toRow <= totalRows;
    if (!isValidRange) return false;
    if (category.fromRow !== previousEnd + 1) return false;
    previousEnd = category.toRow;
  }

  return previousEnd === totalRows;
}

function validateBlockedSeats(blockedSeats) {
  const { rows, columns } = this.seatLayout || {};
  return blockedSeats.every((label) => {
    if (!SEAT_LABEL_PATTERN.test(label)) return false;
    const rowNumber = label.charCodeAt(0) - 64; // A = 1
    const columnNumber = Number(label.slice(1));
    return rowNumber <= rows && columnNumber >= 1 && columnNumber <= columns;
  });
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      uppercase: true,
      trim: true,
    },
    fromRow: { type: Number, required: [true, 'fromRow is required'], min: 1 },
    toRow: { type: Number, required: [true, 'toRow is required'], min: 1 },
    priceMultiplier: { type: Number, default: 1, min: [0.1, 'Multiplier must be at least 0.1'] },
  },
  { _id: false },
);

const screenSchema = new mongoose.Schema(
  {
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater is required'],
    },
    name: { type: String, required: [true, 'Screen name is required'], trim: true },
    type: {
      type: String,
      enum: { values: SCREEN_TYPE_VALUES, message: 'Invalid screen type' },
      default: SCREEN_TYPE.TWO_D,
    },
    seatLayout: {
      rows: {
        type: Number,
        required: [true, 'Rows are required'],
        min: [1, 'Rows must be at least 1'],
        max: [26, 'Rows must be at most 26 (A-Z)'],
        validate: { validator: Number.isInteger, message: 'Rows must be an integer' },
      },
      columns: {
        type: Number,
        required: [true, 'Columns are required'],
        min: [1, 'Columns must be at least 1'],
        max: [30, 'Columns must be at most 30'],
        validate: { validator: Number.isInteger, message: 'Columns must be an integer' },
      },
      categories: {
        type: [categorySchema],
        validate: {
          validator: validateCategories,
          message: 'Categories must be non-overlapping and cover every row',
        },
      },
      blockedSeats: {
        type: [String],
        default: [],
        validate: {
          validator: validateBlockedSeats,
          message: 'Blocked seats must be valid labels inside the layout (e.g. A1)',
        },
      },
    },
    isActive: { type: Boolean, default: true },
  },
  buildSchemaOptions(),
);

screenSchema.virtual('totalSeats').get(function () {
  const { rows, columns, blockedSeats } = this.seatLayout || {};
  if (!rows || !columns) return 0;
  return rows * columns - new Set(blockedSeats).size;
});

screenSchema.index({ theater: 1, name: 1 }, { unique: true });

export default mongoose.model('Screen', screenSchema);
