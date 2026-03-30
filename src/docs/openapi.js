const { env } = require('../config/env');

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PPDC Backend APIs',
    version: '1.0.0',
    description:
      'REST API scaffold built with Express, Prisma, and Neon Postgres. Use Swagger UI to inspect and test the available endpoints.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: 'Local development',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Service availability and runtime checks.',
    },
    {
      name: 'Auth',
      description: 'Authentication endpoints for registration and login.',
    },
    {
      name: 'Users',
      description: 'User management endpoints.',
    },
  ],
  components: {
    schemas: {
      UserRole: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
        example: 'USER',
      },
      CountryScope: {
        type: 'string',
        enum: ['UNITED_KINGDOM', 'UNITED_STATES', 'NIGERIA'],
        example: 'NIGERIA',
      },
      UserAccessScope: {
        type: 'object',
        properties: {
          allPlatforms: {
            type: 'boolean',
            example: false,
          },
          countries: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CountryScope',
            },
            example: ['UNITED_STATES', 'NIGERIA'],
          },
        },
        required: ['allPlatforms', 'countries'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Internal server error',
          },
          details: {
            nullable: true,
            example: null,
          },
          requestId: {
            type: 'string',
            nullable: true,
            example: 'a9c44343-84d1-42fc-9be9-8dbff6c72e25',
          },
        },
        required: ['success', 'message'],
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  example: 'accessScope.countries',
                },
                message: {
                  type: 'string',
                  example: 'Select at least one country or enable all platforms',
                },
              },
            },
          },
        },
        required: ['success', 'message'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'OK',
          },
          data: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'healthy',
              },
              environment: {
                type: 'string',
                example: 'development',
              },
              uptime: {
                type: 'number',
                format: 'float',
                example: 245.38,
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2026-03-30T09:31:00.000Z',
              },
            },
            required: ['status', 'environment', 'uptime', 'timestamp'],
          },
        },
        required: ['success', 'message', 'data'],
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cm8w9kof70000v0q1l5p0x7mt',
          },
          firstName: {
            type: 'string',
            example: 'Jane',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          role: {
            $ref: '#/components/schemas/UserRole',
          },
          accessScope: {
            $ref: '#/components/schemas/UserAccessScope',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-03-30T13:12:10.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-03-30T13:12:10.000Z',
          },
        },
        required: ['id', 'firstName', 'lastName', 'email', 'role', 'accessScope', 'createdAt', 'updatedAt'],
      },
      CreateUserRequest: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            example: 'Jane',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            example: 'strongPassword123',
          },
          role: {
            $ref: '#/components/schemas/UserRole',
          },
          accessScope: {
            $ref: '#/components/schemas/UserAccessScope',
          },
        },
        required: ['firstName', 'lastName', 'email', 'password', 'accessScope'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            example: 'Jane',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            example: 'strongPassword123',
          },
          role: {
            $ref: '#/components/schemas/UserRole',
          },
          accessScope: {
            $ref: '#/components/schemas/UserAccessScope',
          },
        },
        required: ['firstName', 'lastName', 'email', 'password', 'accessScope'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'strongPassword123',
          },
        },
        required: ['email', 'password'],
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          tokenType: {
            type: 'string',
            example: 'Bearer',
          },
          accessTokenExpiresIn: {
            type: 'string',
            example: '15m',
          },
          refreshTokenExpiresIn: {
            type: 'string',
            example: '7d',
          },
        },
        required: ['accessToken', 'refreshToken', 'tokenType'],
      },
      CreateUserResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'User created successfully',
          },
          data: {
            $ref: '#/components/schemas/User',
          },
        },
        required: ['success', 'message', 'data'],
      },
      UserListResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Users fetched successfully',
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        required: ['success', 'message', 'data'],
      },
      UserByIdResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'User fetched successfully',
          },
          data: {
            $ref: '#/components/schemas/User',
          },
        },
        required: ['success', 'message', 'data'],
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'User registered successfully',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              tokens: {
                $ref: '#/components/schemas/AuthTokens',
              },
            },
            required: ['user', 'tokens'],
          },
        },
        required: ['success', 'message', 'data'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              tokens: {
                $ref: '#/components/schemas/AuthTokens',
              },
            },
            required: ['user', 'tokens'],
          },
        },
        required: ['success', 'message', 'data'],
      },
    },
    parameters: {
      UserIdParam: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'User identifier.',
        schema: {
          type: 'string',
          example: 'cm8w9kof70000v0q1l5p0x7mt',
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the current service status, environment, and uptime.',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user record with role and access scope, then returns authentication tokens.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterResponse',
                },
              },
            },
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
          409: {
            description: 'A user with this email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in a user',
        description: 'Authenticates an existing user using email and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a user',
        description: 'Creates a user with identity details, role, and access scope selections.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateUserResponse',
                },
              },
            },
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
          409: {
            description: 'A user with this email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'Returns all users ordered by creation date.',
        responses: {
          200: {
            description: 'Users fetched successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/{userId}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Returns a single user by identifier.',
        parameters: [{ $ref: '#/components/parameters/UserIdParam' }],
        responses: {
          200: {
            description: 'User fetched successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserByIdResponse',
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = { openApiSpec };
