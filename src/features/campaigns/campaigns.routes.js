const { Router } = require('express');
const { authenticate } = require('../../core/middleware/authenticate');
const { authorizeRoles } = require('../../core/middleware/authorize-roles');
const { validateRequest } = require('../../core/middleware/validate-request');
const { asyncHandler } = require('../../core/utils/async-handler');
const {
  listCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignDisabled,
} = require('./campaigns.controller');
const {
  createCampaignSchema,
  updateCampaignSchema,
  campaignIdParamsSchema,
  listCampaignsQuerySchema,
} = require('./campaigns.validation');

const campaignsRouter = Router();

campaignsRouter.use(authenticate, authorizeRoles('ADMIN', 'USER'));

campaignsRouter.get(
  '/',
  validateRequest({ query: listCampaignsQuerySchema }),
  asyncHandler(listCampaigns),
);

campaignsRouter.post(
  '/',
  validateRequest({ body: createCampaignSchema }),
  asyncHandler(createCampaign),
);

campaignsRouter.get(
  '/:id',
  validateRequest({ params: campaignIdParamsSchema }),
  asyncHandler(getCampaign),
);

campaignsRouter.patch(
  '/:id',
  validateRequest({ params: campaignIdParamsSchema, body: updateCampaignSchema }),
  asyncHandler(updateCampaign),
);

campaignsRouter.delete(
  '/:id',
  validateRequest({ params: campaignIdParamsSchema }),
  asyncHandler(deleteCampaign),
);

campaignsRouter.patch(
  '/:id/toggle-disabled',
  validateRequest({ params: campaignIdParamsSchema }),
  asyncHandler(toggleCampaignDisabled),
);

module.exports = { campaignsRouter };
