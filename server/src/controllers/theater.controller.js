import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as theaterService from '../services/theater.service.js';

const getMeta = (req) => ({ ip: req.ip });

export const listTheaters = asyncHandler(async (req, res) => {
  const { theaters, meta } = await theaterService.listPublic(req.validated.query);
  ApiResponse.send(res, { data: { theaters }, meta });
});

export const listManageable = asyncHandler(async (req, res) => {
  const { theaters, meta } = await theaterService.listManageable(req.user, req.validated.query);
  ApiResponse.send(res, { data: { theaters }, meta });
});

export const listCities = asyncHandler(async (_req, res) => {
  const cities = await theaterService.listCities();
  ApiResponse.send(res, { data: { cities } });
});

export const getTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.getPublicTheater(req.validated.params.id);
  ApiResponse.send(res, { data: { theater } });
});

export const createTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.createTheater(req.user, req.validated.body, getMeta(req));
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Theater created',
    data: { theater },
  });
});

export const updateTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.updateTheater(
    req.user,
    req.validated.params.id,
    req.validated.body,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Theater updated', data: { theater } });
});

export const deactivateTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.deactivateTheater(
    req.user,
    req.validated.params.id,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Theater deactivated', data: { theater } });
});
