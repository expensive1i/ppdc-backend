const { z } = require('zod');

const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

module.exports = { userIdParamSchema };
