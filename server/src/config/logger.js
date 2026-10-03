import path from 'node:path';
import { fileURLToPath } from 'node:url';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from './env.js';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const logDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../logs');

const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: time, level, message, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${time} ${level}: ${stack || message}${extra}`;
  }),
);

const productionFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [
  new winston.transports.Console({
    format: env.isProduction ? productionFormat : developmentFormat,
  }),
];

if (!env.isTest) {
  const fileOptions = {
    dirname: logDirectory,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    maxSize: '20m',
    zippedArchive: true,
    format: productionFormat,
  };
  transports.push(
    new DailyRotateFile({ ...fileOptions, filename: 'combined-%DATE%.log' }),
    new DailyRotateFile({ ...fileOptions, filename: 'error-%DATE%.log', level: 'error' }),
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  silent: env.isTest,
  transports,
});
