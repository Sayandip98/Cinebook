import Theater from '../models/theater.model.js';
import { exactMatchInsensitive } from '../utils/queryHelpers.js';

export const create = (data) => Theater.create(data);

export const findById = (id) => Theater.findById(id);

export const findPaginated = (filter, { sort, skip, limit }) =>
  Theater.find(filter).sort(sort).skip(skip).limit(limit);

export const count = (filter) => Theater.countDocuments(filter);

export const updateById = (id, update) =>
  Theater.findByIdAndUpdate(id, update, { new: true, runValidators: true });

export const countByManager = (managerId) => Theater.countDocuments({ manager: managerId });

export const findActiveCities = () => Theater.distinct('city', { isActive: true });

export const findActiveIdsByCity = (city) =>
  Theater.find({ city: exactMatchInsensitive(city), isActive: true }).distinct('_id');
