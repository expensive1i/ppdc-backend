const { env } = require('../config/env');

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PPDC Backend API',
    version: '1.0.0',
    description:
      'REST API scaffold built with Express and PostgreSQL. Use Swagger UI to inspect and test the currently available endpoints.',
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
      description: 'Authentication endpoints. Currently scaffolded and returning 501 responses.',
    },
    {
      name: 'Users',
      description: 'User management endpoints. Currently scaffolded and returning 501 responses.',
    },
  ],
  components: {
    schemas: {
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
      NotImplementedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Not implemented: register',
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
      RegisterRequest: {
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
            minLength: 8,
            example: 'strongPassword123',
          },
          fullName: {
            type: 'string',
            minLength: 2,
            example: 'Jane Doe',
          },
        },
        required: ['email', 'password', 'fullName'],
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
      UserListResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Not implemented: list users',
          },
        },
        required: ['success', 'message'],
      },
      UserByIdResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Not implemented: get user 1',
          },
        },
        required: ['success', 'message'],
      },
    },
    parameters: {
      UserIdParam: {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'Numeric user identifier.',
        schema: {
          type: 'integer',
          minimum: 1,
          example: 1,
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
        description: 'Scaffolded endpoint for user registration. Currently returns a 501 response.',
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
          501: {
            description: 'Endpoint scaffold exists but is not implemented yet',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NotImplementedResponse',
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
        description: 'Scaffolded endpoint for user login. Currently returns a 501 response.',
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
          501: {
            description: 'Endpoint scaffold exists but is not implemented yet',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NotImplementedResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'Scaffolded endpoint for fetching users. Currently returns a 501 response.',
        responses: {
          501: {
            description: 'Endpoint scaffold exists but is not implemented yet',
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
        description: 'Scaffolded endpoint for fetching a single user. Currently returns a 501 response.',
        parameters: [{ $ref: '#/components/parameters/UserIdParam' }],
        responses: {
          501: {
            description: 'Endpoint scaffold exists but is not implemented yet',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserByIdResponse',
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
