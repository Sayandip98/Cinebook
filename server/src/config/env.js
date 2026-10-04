import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5000),
  MONGO_URI: Joi.string()
    .pattern(/^mongodb(\+srv)?:\/\//)
    .required(),
  CLIENT_URL: Joi.string().required(),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  SEED_ADMIN_EMAIL: Joi.string().email(),
  SEED_ADMIN_PASSWORD: Joi.string().min(8),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: Joi.number().integer().min(1).default(7),
  EMAIL_VERIFY_EXPIRES_HOURS: Joi.number().min(1).default(24),
  RESET_PASSWORD_EXPIRES_MINUTES: Joi.number().min(1).default(15),
  COOKIE_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),
  SMTP_HOST: Joi.string(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_USER: Joi.string(),
  SMTP_PASS: Joi.string(),
  EMAIL_FROM: Joi.string().default('CineBook <no-reply@cinebook.local>'),
  CLOUDINARY_CLOUD_NAME: Joi.string(),
  CLOUDINARY_API_KEY: Joi.string(),
  CLOUDINARY_API_SECRET: Joi.string(),
}).unknown(true);

const { error, value } = schema.validate(process.env, { abortEarly: false });

if (error) {
  const details = error.details.map((item) => `  - ${item.message}`).join('\n');
  console.error(`Invalid environment configuration:\n${details}`);
  process.exit(1);
}

export const env = Object.freeze({
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,
  MONGO_URI: value.MONGO_URI,
  CLIENT_URL: value.CLIENT_URL,
  LOG_LEVEL: value.LOG_LEVEL,
  isProduction: value.NODE_ENV === 'production',
  isTest: value.NODE_ENV === 'test',
  BCRYPT_SALT_ROUNDS: value.BCRYPT_SALT_ROUNDS,
  SEED_ADMIN_EMAIL: value.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: value.SEED_ADMIN_PASSWORD,
  JWT_ACCESS_SECRET: value.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: value.JWT_ACCESS_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_DAYS: value.REFRESH_TOKEN_EXPIRES_DAYS,
  EMAIL_VERIFY_EXPIRES_HOURS: value.EMAIL_VERIFY_EXPIRES_HOURS,
  RESET_PASSWORD_EXPIRES_MINUTES: value.RESET_PASSWORD_EXPIRES_MINUTES,
  COOKIE_SAME_SITE: value.COOKIE_SAME_SITE,
  SMTP_HOST: value.SMTP_HOST,
  SMTP_PORT: value.SMTP_PORT,
  SMTP_USER: value.SMTP_USER,
  SMTP_PASS: value.SMTP_PASS,
  EMAIL_FROM: value.EMAIL_FROM,
  CLOUDINARY_CLOUD_NAME: value.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: value.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: value.CLOUDINARY_API_SECRET,
});
