import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as couponService from '../services/coupon.service.js';

const getMeta = (req) => ({ ip: req.ip });

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.validated.query;
  const coupon = await couponService.previewCoupon(req.user, code, subtotal);
  ApiResponse.send(res, { data: { coupon } });
});

export const listAvailable = asyncHandler(async (_req, res) => {
  const coupons = await couponService.listAvailable();
  ApiResponse.send(res, { data: { coupons } });
});

export const listForAdmin = asyncHandler(async (req, res) => {
  const { coupons, meta } = await couponService.listForAdmin(req.validated.query);
  ApiResponse.send(res, { data: { coupons }, meta });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.user, req.validated.body, getMeta(req));
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Coupon created',
    data: { coupon },
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(
    req.user,
    req.validated.params.id,
    req.validated.body,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Coupon updated', data: { coupon } });
});
