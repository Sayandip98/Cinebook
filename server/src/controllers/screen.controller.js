import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as screenService from '../services/screen.service.js';

const getMeta = (req) => ({ ip: req.ip });

export const listScreens = asyncHandler(async (req, res) => {
  const screens = await screenService.listScreens(req.validated.params.theaterId);
  ApiResponse.send(res, { data: { screens } });
});

export const createScreen = asyncHandler(async (req, res) => {
  const screen = await screenService.createScreen(
    req.user,
    req.validated.params.theaterId,
    req.validated.body,
    getMeta(req),
  );
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Screen created',
    data: { screen },
  });
});

export const updateScreen = asyncHandler(async (req, res) => {
  const screen = await screenService.updateScreen(
    req.user,
    req.validated.params.id,
    req.validated.body,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Screen updated', data: { screen } });
});

export const deactivateScreen = asyncHandler(async (req, res) => {
  const screen = await screenService.deactivateScreen(
    req.user,
    req.validated.params.id,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Screen deactivated', data: { screen } });
});
