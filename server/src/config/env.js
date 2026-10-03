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
});
