import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('error', (error) => logger.error('MongoDB error', { error: error.message }));

export const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};
