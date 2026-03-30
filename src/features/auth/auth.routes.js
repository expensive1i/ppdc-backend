const { Router } = require('express');
const { asyncHandler } = require('../../core/utils/async-handler');
const { validateRequest } = require('../../core/middleware/validate-request');
const { register, login } = require('./auth.controller');
const { registerSchema, loginSchema } = require('./auth.validation');

const authRouter = Router();

authRouter.post('/register', validateRequest({ body: registerSchema }), asyncHandler(register));
authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(login));

module.exports = { authRouter };
