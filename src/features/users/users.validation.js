const { z } = require('zod');

const userRoleSchema = z.enum(['ADMIN', 'USER']);
const countryScopeSchema = z.enum(['UNITED_KINGDOM', 'UNITED_STATES', 'NIGERIA']);

const accessScopeSchema = z
  .object({
    allPlatforms: z.boolean().default(false),
    countries: z.array(countryScopeSchema).default([]),
  })
  .superRefine((value, ctx) => {
    if (!value.allPlatforms && value.countries.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['countries'],
        message: 'Select at least one country or enable all platforms',
      });
    }
  });

const createUserSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleSchema.default('USER'),
  accessScope: accessScopeSchema,
});

const userIdParamSchema = z.object({
  userId: z.string().trim().min(1, 'User id is required'),
});

module.exports = {
  accessScopeSchema,
  countryScopeSchema,
  createUserSchema,
  userIdParamSchema,
  userRoleSchema,
};
