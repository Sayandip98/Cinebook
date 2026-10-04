import Joi from 'joi';

const email = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .max(254)
  .required();

const newPassword = Joi.string()
  .min(8)
  .max(72)
  .pattern(/[A-Za-z]/, 'letter')
  .pattern(/\d/, 'number')
  .required()
  .messages({ 'string.pattern.name': 'Password must contain at least one {#name}' });

const token = Joi.string().hex().length(80).required();

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
    email,
    password: newPassword,
    phone: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .messages({ 'string.pattern.base': 'Phone number is invalid' }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email,
    password: Joi.string().max(72).required(),
  }),
};

export const emailOnlySchema = {
  body: Joi.object({ email }),
};

export const verifyEmailSchema = {
  body: Joi.object({ token }),
};

export const resetPasswordSchema = {
  body: Joi.object({ token, password: newPassword }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().max(72).required(),
    newPassword,
  }),
};
