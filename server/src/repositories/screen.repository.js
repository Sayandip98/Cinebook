import Screen from '../models/screen.model.js';

export const create = (data) => Screen.create(data);

export const findById = (id) => Screen.findById(id);

export const findActiveByTheater = (theaterId) =>
  Screen.find({ theater: theaterId, isActive: true }).sort({ name: 1 });
