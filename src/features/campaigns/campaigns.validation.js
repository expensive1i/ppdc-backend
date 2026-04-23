const { z } = require('zod');
const { CAMPAIGN_STATUSES } = require('./campaigns.constants');

const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);

const campaignPayloadShape = {
  campaignCode: z.string().trim().min(3).max(60),
  title: z.string().trim().min(3).max(200),
  beneficiaryName: z.string().trim().min(2).max(200),
  shortSummary: z.string().trim().min(10).max(500),
  story: z.string().trim().min(10),
  currency: z.string().trim().length(3),
  status: campaignStatusSchema.default('draft'),
  goalAmount: z.number().positive(),
  totalFundsRaised: z.number().min(0).optional(),
  paystackSubAcctCode: z.string().trim().max(100).optional().nullable(),
  showProgressPublicly: z.boolean().default(true),
  isDisabled: z.boolean().default(false),
  imageUrls: z.array(z.url()).max(10).default([]),
};

const createCampaignSchema = z.object(campaignPayloadShape);

const updateCampaignSchema = z
  .object(
    Object.fromEntries(
      Object.entries(campaignPayloadShape).map(([key, schema]) => [key, schema.optional()]),
    ),
  )
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided to update',
  });

const campaignIdParamsSchema = z.object({ id: z.string().min(1) });

const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().default(''),
  status: campaignStatusSchema.optional(),
});

module.exports = {
  createCampaignSchema,
  updateCampaignSchema,
  campaignIdParamsSchema,
  listCampaignsQuerySchema,
};
