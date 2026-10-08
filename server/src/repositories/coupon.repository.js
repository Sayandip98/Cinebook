import Coupon from '../models/coupon.model.js';

export const create = (data) => Coupon.create(data);

export const findById = (id) => Coupon.findById(id);

export const findByCode = (code) => Coupon.findOne({ code: code.trim().toUpperCase() });

export const findPaginated = (filter, { skip, limit }) =>
  Coupon.find(filter).sort({ createdAt: -1, _id: 1 }).skip(skip).limit(limit);

export const count = (filter) => Coupon.countDocuments(filter);

// Currently valid and not fully used up. `usageLimit: null` matches "no limit".
export const findAvailable = (now, limit) =>
  Coupon.find({
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
    $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
  })
    .select('code description type value maxDiscount minOrderAmount validTo')
    .sort({ validTo: 1 })
    .limit(limit);

export const incrementUsed = (id, session) =>
  Coupon.updateOne({ _id: id }, { $inc: { usedCount: 1 } }, { session });

export const decrementUsed = (id, session) =>
  Coupon.updateOne({ _id: id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }, { session });
