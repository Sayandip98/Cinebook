import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse.js';

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const getHealth = (_req, res) => {
  ApiResponse.send(res, {
    message: 'Service is healthy',
    data: {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: DB_STATES[mongoose.connection.readyState],
    },
  });
};
