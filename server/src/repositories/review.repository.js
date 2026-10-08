import mongoose from 'mongoose';
import Review from '../models/review.model.js';

const USER_POPULATE = { path: 'user', select: 'name avatar.url' };

export const create = (data) => Review.create(data);

export const findById = (id) => Review.findById(id);

export const findByIdPopulated = (id) => Review.findById(id).populate(USER_POPULATE);

export const findByUserAndMovie = (userId, movieId) =>
  Review.findOne({ user: userId, movie: movieId }).populate(USER_POPULATE);

export const findPaginatedByMovie = (movieId, { sort, skip, limit }) =>
  Review.find({ movie: movieId }).sort(sort).skip(skip).limit(limit).populate(USER_POPULATE);

export const countByMovie = (movieId) => Review.countDocuments({ movie: movieId });

export const deleteById = (id) => Review.findByIdAndDelete(id);

export const getRatingSummary = async (movieId) => {
  const [row] = await Review.aggregate([
    { $match: { movie: new mongoose.Types.ObjectId(String(movieId)) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  return { average: row ? Math.round(row.average * 100) / 100 : 0, count: row?.count ?? 0 };
};
