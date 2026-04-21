const { z } = require('zod');
const { MANAGEMENT_AREAS, MANAGED_REGIONS, USER_ROLES, USER_SORT_FIELDS } = require('./users.constants');

const userRoleSchema = z.enum(USER_ROLES);
const managedRegionSchema = z.enum(MANAGED_REGIONS);
const managementAreaSchema = z.enum(MANAGEMENT_AREAS);

const managedRegionsSchema = z
  .array(managedRegionSchema)
  .min(1, 'Select at least one managed region')
  .transform((regions) => {
    if (regions.includes('all')) {
      return ['all'];
    }

    return [...new Set(regions)];
  });

const managementAreasSchema = z
  .array(managementAreaSchema)
  .default([])
  .transform((areas) => [...new Set(areas)]);

const createUserSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
    email: z.email().transform((value) => value.trim().toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: userRoleSchema.default('USER'),
    managedRegions: managedRegionsSchema,
    managementAreas: managementAreasSchema.optional().default([]),
  })
  .superRefine((payload, ctx) => {
    if (payload.role !== 'ADMIN' && payload.managementAreas.includes('USER_MANAGEMENT')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only admin users can be granted user management access',
        path: ['managementAreas'],
      });
    }
  });

const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').optional(),
    email: z
      .email()
      .transform((value) => value.trim().toLowerCase())
      .optional(),
    role: userRoleSchema.optional(),
    managedRegions: managedRegionsSchema.optional(),
    managementAreas: managementAreasSchema.optional(),
  })
  .superRefine((payload, ctx) => {
    if (payload.role === 'USER' && payload.managementAreas?.includes('USER_MANAGEMENT')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only admin users can be granted user management access',
        path: ['managementAreas'],
      });
    }
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Provide at least one field to update',
  });

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(''),
  region: managedRegionSchema.optional(),
  sortBy: z.enum(USER_SORT_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const userIdParamSchema = z.object({
  userId: z.string().trim().min(1, 'User id is required'),
});

module.exports = {
  createUserSchema,
  listUsersQuerySchema,
  managementAreasSchema,
  managedRegionSchema,
  managedRegionsSchema,
  userIdParamSchema,
  userRoleSchema,
  updateUserSchema,
  updateUserStatusSchema,
};
