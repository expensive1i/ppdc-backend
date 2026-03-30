const { Router } = require('express');

const { validateRequest } = require('../../core/middleware/validate-request');
const { asyncHandler } = require('../../core/utils/async-handler');
const { createContactSubmission } = require('./content.public.controller');
const { contactPublicParamsSchema, createPublicContactSchema } = require('./content.validation');

const publicContentRouter = Router();

publicContentRouter.post(
  '/:country/contact',
  validateRequest({ params: contactPublicParamsSchema, body: createPublicContactSchema }),
  asyncHandler(createContactSubmission),
);

module.exports = { publicContentRouter };
