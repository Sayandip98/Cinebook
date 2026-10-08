import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as reviewService from '../services/review.service.js';

export const listReviews = asyncHandler(async (req, res) => {
  const { reviews, meta } = await reviewService.listReviews(
    req.validated.params.id,
    req.validated.query,
  );
  ApiResponse.send(res, { data: { reviews }, meta });
});

export const getMyReview = asyncHandler(async (req, res) => {
  const result = await reviewService.getMyReview(req.user, req.validated.params.id);
  ApiResponse.send(res, { data: result });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user,
    req.validated.params.id,
    req.validated.body,
  );
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Review posted',
    data: { review },
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.user,
    req.validated.params.id,
    req.validated.body,
  );
  ApiResponse.send(res, { message: 'Review updated', data: { review } });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user, req.validated.params.id, { ip: req.ip });
  ApiResponse.send(res, { message: 'Review deleted' });
});
