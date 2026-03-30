const { Router } = require('express');
const { healthRouter } = require('../features/health/health.routes');
const { adminRouter } = require('./admin');
const { publicRouter } = require('./public');

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/public', publicRouter);

module.exports = { apiRouter };
