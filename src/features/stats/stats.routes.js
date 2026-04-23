const { Router } = require('express');
const { authenticate } = require('../../core/middleware/authenticate');
const { authorizeRoles } = require('../../core/middleware/authorize-roles');
const { asyncHandler } = require('../../core/utils/async-handler');
const { listStats } = require('./stats.controller');

const statsRouter = Router();

statsRouter.use(authenticate, authorizeRoles('ADMIN', 'USER'));

statsRouter.get('/', asyncHandler(listStats));

module.exports = { statsRouter };
