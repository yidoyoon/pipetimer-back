import * as Joi from 'joi';

export const validationSchema =
  process.env.NODE_ENV === 'development'
    ? Joi.object({
        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_AUTH_USER: Joi.string().required(),
        EMAIL_AUTH_PASSWORD: Joi.string().required(),
      })
    : Joi.object({
        SENDGRID_KEY: Joi.string().required(),
      });
