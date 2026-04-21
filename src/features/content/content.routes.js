const { Router } = require('express');

const { authenticate } = require('../../core/middleware/authenticate');
const { authorizeRoles } = require('../../core/middleware/authorize-roles');
const { validateRequest } = require('../../core/middleware/validate-request');
const { asyncHandler } = require('../../core/utils/async-handler');
const {
  createContentItem,
  deleteContactSubmission,
  deleteContentItem,
  getContactSubmission,
  getContentItem,
  listContactSubmissions,
  listContentItems,
  updateContactSubmissionStatus,
  updateContentItem,
} = require('./content.controller');
const {
  contactItemParamsSchema,
  contactRouteParamsSchema,
  contentItemParamsSchema,
  contentListParamsSchema,
  contentRouteParamsSchema,
  createContentSchema,
  listContactsQuerySchema,
  listContentQuerySchema,
  updateContactStatusSchema,
  updateContentSchema,
} = require('./content.validation');

const contentRouter = Router();

contentRouter.use(authenticate, authorizeRoles('ADMIN', 'USER'));

contentRouter.get(
  '/:country/contacts',
  validateRequest({ params: contactRouteParamsSchema, query: listContactsQuerySchema }),
  asyncHandler(listContactSubmissions),
);
contentRouter.get(
  '/:country/contacts/:id',
  validateRequest({ params: contactItemParamsSchema }),
  asyncHandler(getContactSubmission),
);
contentRouter.patch(
  '/:country/contacts/:id/status',
  validateRequest({ params: contactItemParamsSchema, body: updateContactStatusSchema }),
  asyncHandler(updateContactSubmissionStatus),
);
contentRouter.delete(
  '/:country/contacts/:id',
  validateRequest({ params: contactItemParamsSchema }),
  asyncHandler(deleteContactSubmission),
);

contentRouter.get(
  '/:country/:resource',
  validateRequest({ params: contentListParamsSchema, query: listContentQuerySchema }),
  asyncHandler(listContentItems),
);
contentRouter.post(
  '/:country/:resource',
  validateRequest({ params: contentRouteParamsSchema, body: createContentSchema }),
  asyncHandler(createContentItem),
);
contentRouter.get(
  '/:country/:resource/:id',
  validateRequest({ params: contentItemParamsSchema }),
  asyncHandler(getContentItem),
);
contentRouter.patch(
  '/:country/:resource/:id',
  validateRequest({ params: contentItemParamsSchema, body: updateContentSchema }),
  asyncHandler(updateContentItem),
);
contentRouter.delete(
  '/:country/:resource/:id',
  validateRequest({ params: contentItemParamsSchema }),
  asyncHandler(deleteContentItem),
);

module.exports = { contentRouter };
