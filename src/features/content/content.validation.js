const { z } = require('zod');
const {
  CONTACT_STATUSES,
  CONTENT_COUNTRY_FILTERS,
  CONTENT_COUNTRIES,
  CONTENT_ITEM_RESOURCES,
  CONTENT_RESOURCES,
  CONTENT_STATUSES,
} = require('./content.constants');

function normalizeTagsInput(value) {
  if (value == null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return value;
}

const contentCountrySchema = z.enum(CONTENT_COUNTRIES);
const contentCountryFilterSchema = z.enum(CONTENT_COUNTRY_FILTERS);
const contentResourceSchema = z.enum(CONTENT_RESOURCES);
const contentItemResourceSchema = z.enum(CONTENT_ITEM_RESOURCES);
const contentStatusSchema = z.enum(CONTENT_STATUSES);
const contactStatusSchema = z.enum(CONTACT_STATUSES);

const tagsSchema = z.preprocess(
  normalizeTagsInput,
  z.array(z.string().trim().min(1).max(50)).max(20).transform((tags) => [...new Set(tags)]),
);

const publishDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'publishDate must be in YYYY-MM-DD format')
  .optional()
  .nullable();

const contentPayloadShape = {
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220).optional(),
  type: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(120),
  tags: tagsSchema.default([]),
  summary: z.string().trim().min(3).max(500),
  description: z.string().trim().max(500).optional().nullable(),
  imageUrl: z.url().max(2000),
  author: z.string().trim().min(2).max(120).optional(),
  publishDate: publishDateSchema,
  readingTime: z.string().trim().min(2).max(40),
  content: z.string().trim().min(1),
  status: contentStatusSchema.default('draft'),
};

const createContentSchema = z.object(contentPayloadShape);
const updateContentSchema = z.object(
  Object.fromEntries(
    Object.entries(contentPayloadShape).map(([key, schema]) => [key, schema.optional()]),
  ),
).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided',
});

const listContentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(''),
  category: z.string().trim().optional(),
  type: z.string().trim().optional(),
  status: contentStatusSchema.optional(),
});

const listContactsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().default(''),
  status: contactStatusSchema.optional(),
});

const contentRouteParamsSchema = z.object({
  country: contentCountrySchema,
  resource: contentItemResourceSchema,
});

const contentItemParamsSchema = contentRouteParamsSchema.extend({
  id: z.string().trim().min(1),
});

const contentListParamsSchema = z.object({
  country: contentCountryFilterSchema,
  resource: contentResourceSchema,
});

const contactRouteParamsSchema = z.object({
  country: contentCountryFilterSchema,
});

const contactPublicParamsSchema = z.object({
  country: contentCountrySchema,
});

const contactItemParamsSchema = contactRouteParamsSchema.extend({
  id: z.string().trim().min(1),
});

const updateContactStatusSchema = z.object({
  status: contactStatusSchema,
});

const createPublicContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(255),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});

module.exports = {
  contactItemParamsSchema,
  contactPublicParamsSchema,
  contentCountryFilterSchema,
  contactRouteParamsSchema,
  contentCountrySchema,
  contentItemParamsSchema,
  contentItemResourceSchema,
  contentListParamsSchema,
  contentResourceSchema,
  contentRouteParamsSchema,
  createPublicContactSchema,
  createContentSchema,
  listContactsQuerySchema,
  listContentQuerySchema,
  updateContactStatusSchema,
  updateContentSchema,
};
