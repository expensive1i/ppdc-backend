const { Router } = require('express');

const { authRouter } = require('../features/auth/auth.routes');
const { campaignsRouter } = require('../features/campaigns/campaigns.routes');
const { contentRouter } = require('../features/content/content.routes');
const { uploadsRouter } = require('../features/uploads/uploads.routes');
const { usersRouter } = require('../features/users/users.routes');
const { statsRouter } = require('../features/stats/stats.routes');

const adminRouter = Router();

adminRouter.use('/auth', authRouter);
adminRouter.use('/campaigns', campaignsRouter);
adminRouter.use('/content', contentRouter);
adminRouter.use('/uploads', uploadsRouter);
adminRouter.use('/users', usersRouter);
adminRouter.use('/stats', statsRouter);

module.exports = { adminRouter };
