const { Router } = require('express');
const { authenticate } = require('../../core/middleware/authenticate');
const { authorizeRoles } = require('../../core/middleware/authorize-roles');
const { asyncHandler } = require('../../core/utils/async-handler');
const { validateRequest } = require('../../core/middleware/validate-request');
const { createUser, deleteUser, getUserById, listUsers, updateUser, updateUserStatus } = require('./users.controller');
const {
	createUserSchema,
	listUsersQuerySchema,
	updateUserSchema,
	updateUserStatusSchema,
	userIdParamSchema,
} = require('./users.validation');

const usersRouter = Router();

usersRouter.use(authenticate, authorizeRoles('ADMIN'));
usersRouter.post('/', validateRequest({ body: createUserSchema }), asyncHandler(createUser));
usersRouter.get('/', validateRequest({ query: listUsersQuerySchema }), asyncHandler(listUsers));
usersRouter.get('/:userId', validateRequest({ params: userIdParamSchema }), asyncHandler(getUserById));
usersRouter.patch(
	'/:userId',
	validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
	asyncHandler(updateUser),
);
usersRouter.patch(
	'/:userId/status',
	validateRequest({ params: userIdParamSchema, body: updateUserStatusSchema }),
	asyncHandler(updateUserStatus),
);
usersRouter.delete('/:userId', validateRequest({ params: userIdParamSchema }), asyncHandler(deleteUser));

module.exports = { usersRouter };
