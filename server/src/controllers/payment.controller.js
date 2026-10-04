import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as paymentService from '../services/payment.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await paymentService.createOrder(req.user, req.validated.body.bookingId);
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Payment order created',
    data: { order },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const body = req.validated.body;
  const booking = await paymentService.verifyPayment(req.user, {
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  });
  ApiResponse.send(res, { message: 'Payment verified', data: { booking } });
});

export const handleWebhook = asyncHandler(async (req, res) => {
  await paymentService.handleWebhook({
    rawBody: req.body,
    signature: req.get('X-Razorpay-Signature'),
    eventId: req.get('X-Razorpay-Event-Id'),
  });
  res.status(HTTP_STATUS.OK).json({ success: true });
});
