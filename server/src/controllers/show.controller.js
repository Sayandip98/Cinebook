import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as showService from '../services/show.service.js';

const getMeta = (req) => ({ ip: req.ip });

export const listShows = asyncHandler(async (req, res) => {
  const { shows, meta } = await showService.listShows(req.validated.query);
  ApiResponse.send(res, { data: { shows }, meta });
});

export const getShow = asyncHandler(async (req, res) => {
  const show = await showService.getShow(req.validated.params.id);
  ApiResponse.send(res, { data: { show } });
});

export const createShow = asyncHandler(async (req, res) => {
  const show = await showService.createShow(req.user, req.validated.body, getMeta(req));
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Show created',
    data: { show },
  });
});

export const updateShow = asyncHandler(async (req, res) => {
  const show = await showService.updateShow(
    req.user,
    req.validated.params.id,
    req.validated.body,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Show updated', data: { show } });
});

export const cancelShow = asyncHandler(async (req, res) => {
  const show = await showService.cancelShow(req.user, req.validated.params.id, getMeta(req));
  ApiResponse.send(res, { message: 'Show cancelled', data: { show } });
});
