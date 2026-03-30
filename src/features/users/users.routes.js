const { Router } = require('express');
const { asyncHandler } = require('../../core/utils/async-handler');
const { validateRequest } = require('../../core/middleware/validate-request');
const { createUser, listUsers, getUserById } = require('./users.controller');
const { createUserSchema, userIdParamSchema } = require('./users.validation');

const usersRouter = Router();

usersRouter.post('/', validateRequest({ body: createUserSchema }), asyncHandler(createUser));
usersRouter.get('/', asyncHandler(listUsers));
usersRouter.get('/:userId', validateRequest({ params: userIdParamSchema }), asyncHandler(getUserById));

module.exports = { usersRouter };
