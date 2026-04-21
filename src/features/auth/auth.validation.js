const { z } = require('zod');
const { createUserSchema } = require('../users/users.validation');

const registerSchema = createUserSchema;

const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
});

const verifyResetOtpSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
});

const resetPasswordSchema = z
  .object({
    email: z.email().transform((value) => value.trim().toLowerCase()),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((payload) => payload.password === payload.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const refreshSessionSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required'),
});

module.exports = {
  forgotPasswordSchema,
  loginSchema,
  refreshSessionSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
};
