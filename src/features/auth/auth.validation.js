const { z } = require('zod');
const { createUserSchema } = require('../users/users.validation');

const registerSchema = createUserSchema;

const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

module.exports = { registerSchema, loginSchema };
