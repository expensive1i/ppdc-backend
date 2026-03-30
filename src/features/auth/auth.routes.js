const { Router } = require('express');
const { asyncHandler } = require('../../core/utils/async-handler');
const { authenticate } = require('../../core/middleware/authenticate');
const { validateRequest } = require('../../core/middleware/validate-request');
const { login, logout, me, refresh, register } = require('./auth.controller');
const { loginSchema, refreshSessionSchema, registerSchema } = require('./auth.validation');

const authRouter = Router();

authRouter.post('/register', validateRequest({ body: registerSchema }), asyncHandler(register));
authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(login));
authRouter.get('/me', authenticate, asyncHandler(me));
authRouter.post('/refresh', validateRequest({ body: refreshSessionSchema }), asyncHandler(refresh));
authRouter.post('/logout', validateRequest({ body: refreshSessionSchema }), asyncHandler(logout));

module.exports = { authRouter };
