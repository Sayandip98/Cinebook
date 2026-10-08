import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { COUPON_TYPE } from '../constants/couponType.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import * as couponRepository from '../repositories/coupon.repository.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as auditService from './audit.service.js';

const AVAILABLE_LIMIT = 20;

const badRequest = (message) => new ApiError(HTTP_STATUS.BAD_REQUEST, message);
const roundMoney = (value) => Math.round(value * 100) / 100;

export const calculateDiscount = (coupon, subtotal) => {
  let discount =
    coupon.type === COUPON_TYPE.PERCENT ? (subtotal * coupon.value) / 100 : coupon.value;

  if (coupon.type === COUPON_TYPE.PERCENT && coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  return roundMoney(Math.min(discount, subtotal));
};

// The single rule set, used by the preview and by the real booking.
export const evaluateCoupon = async (code, userId, subtotal) => {
  const coupon = await couponRepository.findByCode(code);
  if (!coupon || !coupon.isActive) throw badRequest('Invalid coupon code');

  const now = new Date();
  if (now < coupon.validFrom) throw badRequest('This coupon is not active yet');
  if (now > coupon.validTo) throw badRequest('This coupon has expired');
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw badRequest('This coupon has been fully redeemed');
  }
  if (subtotal < coupon.minOrderAmount) {
    throw badRequest(`Add tickets worth Rs ${coupon.minOrderAmount} or more to use this coupon`);
  }

  const timesUsed = await bookingRepository.countCouponUsageByUser(userId, coupon._id);
  if (timesUsed >= coupon.perUserLimit) {
    throw badRequest('You have already used this coupon the maximum number of times');
  }

  return { coupon, discount: calculateDiscount(coupon, subtotal) };
};

export const previewCoupon = async (user, code, subtotal) => {
  const { coupon, discount } = await evaluateCoupon(code, user._id, subtotal);
  return {
    code: coupon.code,
    description: coupon.description,
    discount,
    subtotalAfterDiscount: roundMoney(subtotal - discount),
  };
};

export const listAvailable = () => couponRepository.findAvailable(new Date(), AVAILABLE_LIMIT);

export const listForAdmin = async (query) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (query.search) filter.code = new RegExp(escapeRegex(query.search.toUpperCase()));
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  const [coupons, total] = await Promise.all([
    couponRepository.findPaginated(filter, { skip, limit }),
    couponRepository.count(filter),
  ]);

  return { coupons, meta: buildPaginationMeta({ page, limit, total }) };
};

export const createCoupon = async (actor, data, { ip } = {}) => {
  // A duplicate code raises a unique-index error, which the error handler turns into a 409.
  const coupon = await couponRepository.create(data);

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.COUPON_CREATED,
    entity: 'Coupon',
    entityId: coupon._id,
    meta: { code: coupon.code },
    ip,
  });
  return coupon;
};

// The code and type never change, so existing bookings keep their meaning.
export const updateCoupon = async (actor, id, data, { ip } = {}) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Coupon not found');

  if (data.usageLimit != null && data.usageLimit < coupon.usedCount) {
    throw badRequest(
      `The usage limit cannot be below the ${coupon.usedCount} redemptions already made`,
    );
  }

  coupon.set(data);
  if (coupon.validTo <= coupon.validFrom) throw badRequest('Valid-to must be after valid-from');
  await coupon.save();

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.COUPON_UPDATED,
    entity: 'Coupon',
    entityId: coupon._id,
    meta: { code: coupon.code, fields: Object.keys(data) },
    ip,
  });
  return coupon;
};
