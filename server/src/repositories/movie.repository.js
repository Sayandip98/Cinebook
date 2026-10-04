import Movie from '../models/movie.model.js';

export const create = (data) => Movie.create(data);

export const findById = (id) => Movie.findById(id);

export const findBySlug = (slug) => Movie.findOne({ slug });

export const findPaginated = (filter, { sort, skip, limit }) =>
  Movie.find(filter).sort(sort).skip(skip).limit(limit);

export const count = (filter) => Movie.countDocuments(filter);

export const deleteById = (id) => Movie.findByIdAndDelete(id);
