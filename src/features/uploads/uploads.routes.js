const { Router } = require('express');

const { authenticate } = require('../../core/middleware/authenticate');
const { authorizeRoles } = require('../../core/middleware/authorize-roles');
const { asyncHandler } = require('../../core/utils/async-handler');
const { uploadImage } = require('./uploads.controller');
const { imageUpload } = require('./uploads.middleware');

const uploadsRouter = Router();

uploadsRouter.use(authenticate, authorizeRoles('ADMIN'));
uploadsRouter.post('/image', imageUpload.single('image'), asyncHandler(uploadImage));

module.exports = { uploadsRouter };
