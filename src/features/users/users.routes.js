const { Router } = require('express');
const { listUsers, getUserById } = require('./users.controller');

const usersRouter = Router();

usersRouter.get('/', listUsers);
usersRouter.get('/:userId', getUserById);

module.exports = { usersRouter };
