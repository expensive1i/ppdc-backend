const { Router } = require('express');
const { healthRouter } = require('../features/health/health.routes');
const { authRouter } = require('../features/auth/auth.routes');
const { usersRouter } = require('../features/users/users.routes');

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);

module.exports = { apiRouter };
