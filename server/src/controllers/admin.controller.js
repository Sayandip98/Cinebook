import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as adminService from '../services/admin.service.js';

const getMeta = (req) => ({ ip: req.ip });

export const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await adminService.listUsers(req.validated.query);
  ApiResponse.send(res, { data: { users }, meta });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await adminService.getUser(req.validated.params.id);
  ApiResponse.send(res, { data: { user } });
});

export const changeRole = asyncHandler(async (req, res) => {
  const user = await adminService.changeRole(
    req.user,
    req.validated.params.id,
    req.validated.body.role,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'User role updated', data: { user } });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const user = await adminService.changeStatus(
    req.user,
    req.validated.params.id,
    req.validated.body.isActive,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'User status updated', data: { user } });
});
