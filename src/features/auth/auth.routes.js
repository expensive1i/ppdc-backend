const { Router } = require('express');
const { asyncHandler } = require('../../core/utils/async-handler');
const { authenticate } = require('../../core/middleware/authenticate');
const { validateRequest } = require('../../core/middleware/validate-request');
const { forgotPassword, login, logout, me, refresh, register, resetPassword, verifyResetOtp } = require('./auth.controller');
const {
	forgotPasswordSchema,
	loginSchema,
	refreshSessionSchema,
	registerSchema,
	resetPasswordSchema,
	verifyResetOtpSchema,
} = require('./auth.validation');

const authRouter = Router(); 

authRouter.post('/register', validateRequest({ body: registerSchema }), asyncHandler(register));
authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(login));
authRouter.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), asyncHandler(forgotPassword));
authRouter.post('/verify-reset-otp', validateRequest({ body: verifyResetOtpSchema }), asyncHandler(verifyResetOtp));
authRouter.post('/reset-password', validateRequest({ body: resetPasswordSchema }), asyncHandler(resetPassword));
authRouter.get('/me', authenticate, asyncHandler(me));
authRouter.post('/refresh', validateRequest({ body: refreshSessionSchema }), asyncHandler(refresh));
authRouter.post('/logout', validateRequest({ body: refreshSessionSchema }), asyncHandler(logout));

module.exports = { authRouter };
