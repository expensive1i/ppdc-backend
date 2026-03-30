const { Router } = require('express');

const { publicContentRouter } = require('../features/content/content.public.routes');

const publicRouter = Router();

publicRouter.use('/', publicContentRouter);

module.exports = { publicRouter };
