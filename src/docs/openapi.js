const { env } = require('../config/env');

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PPDC Backend APIs',
    version: '1.0.0',
    description:
      'Admin-first REST API built with Express, Prisma, Neon Postgres, and Cloudinary-backed image uploads.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: 'Local development',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service availability endpoints.' },
    { name: 'Admin - Auth', description: 'Admin authentication and session management.' },
    { name: 'Admin - Users', description: 'Admin user management.' },
    { name: 'Admin - Uploads', description: 'Admin image upload endpoints.' },
    {
      name: 'Admin - Content',
      description:
        'Country content management for blogs, updates, programs, careers, hero contents, and resources.',
    },
    { name: 'Admin - Contacts', description: 'Country contact submission management.' },
    { name: 'Public - Contact', description: 'Public contact submission endpoint.' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      UserIdParam: {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
      AdminCountryParam: {
        name: 'country',
        in: 'path',
        required: true,
        schema: { $ref: '#/components/schemas/AdminContentCountry' },
      },
      CountryParam: {
        name: 'country',
        in: 'path',
        required: true,
        schema: { $ref: '#/components/schemas/ContentCountry' },
      },
      ContentResourceParam: {
        name: 'resource',
        in: 'path',
        required: true,
        schema: { $ref: '#/components/schemas/ContentItemResource' },
      },
      ContentIdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
      PageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        schema: { type: 'string', default: '' },
      },
      RegionParam: {
        name: 'region',
        in: 'query',
        schema: { $ref: '#/components/schemas/ManagedRegion' },
      },
      SortByParam: {
        name: 'sortBy',
        in: 'query',
        schema: { type: 'string', enum: ['createdAt', 'email', 'firstName', 'lastName'], default: 'createdAt' },
      },
      SortOrderParam: {
        name: 'sortOrder',
        in: 'query',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
      },
      CategoryParam: {
        name: 'category',
        in: 'query',
        schema: { type: 'string' },
      },
      TypeParam: {
        name: 'type',
        in: 'query',
        schema: { type: 'string' },
      },
      ContentStatusParam: {
        name: 'status',
        in: 'query',
        schema: { $ref: '#/components/schemas/ContentStatus' },
      },
      ContactStatusParam: {
        name: 'status',
        in: 'query',
        schema: { $ref: '#/components/schemas/ContactStatus' },
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          details: { nullable: true, example: null },
          requestId: { type: 'string', nullable: true },
        },
        required: ['success', 'message'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'OK' },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'healthy' },
              environment: { type: 'string', example: 'development' },
              uptime: { type: 'number', example: 123.45 },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      UserRole: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
      ManagedRegion: {
        type: 'string',
        enum: ['all', 'uk', 'us', 'nigeria'],
      },
      ManagedRegions: {
        type: 'array',
        items: { $ref: '#/components/schemas/ManagedRegion' },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { $ref: '#/components/schemas/UserRole' },
          managedRegions: { $ref: '#/components/schemas/ManagedRegions' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password', 'managedRegions'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          role: { $ref: '#/components/schemas/UserRole' },
          managedRegions: { $ref: '#/components/schemas/ManagedRegions' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { $ref: '#/components/schemas/UserRole' },
          managedRegions: { $ref: '#/components/schemas/ManagedRegions' },
        },
      },
      UpdateUserStatusRequest: {
        type: 'object',
        required: ['isActive'],
        properties: {
          isActive: { type: 'boolean' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'integer', example: 900 },
        },
      },
      LogoutResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logout successful' },
        },
      },
      UploadImageResponse: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri' },
          publicId: { type: 'string' },
          width: { type: 'integer' },
          height: { type: 'integer' },
          format: { type: 'string' },
          bytes: { type: 'integer' },
          originalName: { type: 'string' },
        },
      },
      AdminContentCountry: {
        type: 'string',
        enum: ['all', 'uk', 'us', 'nigeria'],
      },
      ContentCountry: {
        type: 'string',
        enum: ['uk', 'us', 'nigeria'],
      },
      ContentItemResource: {
        type: 'string',
        enum: ['blogs', 'updates', 'programs', 'careers', 'hero-contents', 'resources'],
      },
      ContentStatus: {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
      },
      ContactStatus: {
        type: 'string',
        enum: ['new', 'acknowledged'],
      },
      ContentItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          country: { $ref: '#/components/schemas/ContentCountry' },
          resource: { $ref: '#/components/schemas/ContentItemResource' },
          title: { type: 'string' },
          slug: { type: 'string' },
          type: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' },
          description: { type: 'string', nullable: true },
          imageUrl: { type: 'string', format: 'uri' },
          author: { type: 'string' },
          publishDate: { type: 'string', nullable: true, example: '2026-03-30' },
          readingTime: { type: 'string', example: '6 min read' },
          content: { type: 'string' },
          status: { $ref: '#/components/schemas/ContentStatus' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ContentItemRequest: {
        type: 'object',
        required: ['title', 'type', 'category', 'summary', 'imageUrl', 'readingTime', 'content'],
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          type: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' },
          description: { type: 'string', nullable: true },
          imageUrl: { type: 'string', format: 'uri' },
          author: { type: 'string' },
          publishDate: { type: 'string', nullable: true, example: '2026-03-30' },
          readingTime: { type: 'string' },
          content: { type: 'string' },
          status: { $ref: '#/components/schemas/ContentStatus' },
        },
      },
      ContentListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/ContentItem' } },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      ContactSubmission: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          country: { $ref: '#/components/schemas/ContentCountry' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          subject: { type: 'string' },
          message: { type: 'string' },
          status: { $ref: '#/components/schemas/ContactStatus' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ContactListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/ContactSubmission' } },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      UpdateContactStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { $ref: '#/components/schemas/ContactStatus' },
        },
      },
      PublicContactRequest: {
        type: 'object',
        required: ['name', 'email', 'subject', 'message'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          subject: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/auth/register': {
      post: {
        tags: ['Admin - Auth'],
        summary: 'Register an admin user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/auth/login': {
      post: {
        tags: ['Admin - Auth'],
        summary: 'Login admin user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/auth/me': {
      get: {
        tags: ['Admin - Auth'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
    '/admin/auth/refresh': {
      post: {
        tags: ['Admin - Auth'],
        summary: 'Refresh session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Tokens refreshed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/auth/logout': {
      post: {
        tags: ['Admin - Auth'],
        summary: 'Logout session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LogoutResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin - Users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { $ref: '#/components/parameters/RegionParam' },
          { $ref: '#/components/parameters/SortByParam' },
          { $ref: '#/components/parameters/SortOrderParam' },
        ],
        responses: {
          200: {
            description: 'User list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    meta: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Admin - Users'],
        summary: 'Create user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
    '/admin/users/{userId}': {
      get: {
        tags: ['Admin - Users'],
        summary: 'Get user by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/UserIdParam' }],
        responses: {
          200: {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Admin - Users'],
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/UserIdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Admin - Users'],
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/UserIdParam' }],
        responses: {
          204: { description: 'User deleted' },
        },
      },
    },
    '/admin/users/{userId}/status': {
      patch: {
        tags: ['Admin - Users'],
        summary: 'Update user active status',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/UserIdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'User status updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
    '/admin/uploads/image': {
      post: {
        tags: ['Admin - Uploads'],
        summary: 'Upload a content image to Cloudinary',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                  folder: { type: 'string', example: 'content/blogs' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Image uploaded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UploadImageResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/content/{country}/{resource}': {
      get: {
        tags: ['Admin - Content'],
        summary: 'List content items',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/AdminCountryParam' },
          { $ref: '#/components/parameters/ContentResourceParam' },
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { $ref: '#/components/parameters/CategoryParam' },
          { $ref: '#/components/parameters/TypeParam' },
          { $ref: '#/components/parameters/ContentStatusParam' },
        ],
        responses: {
          200: {
            description: 'Content list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContentListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Admin - Content'],
        summary: 'Create content item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/CountryParam' },
          { $ref: '#/components/parameters/ContentResourceParam' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContentItemRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Content item created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContentItem' },
              },
            },
          },
        },
      },
    },
    '/admin/content/{country}/{resource}/{id}': {
      get: {
        tags: ['Admin - Content'],
        summary: 'Get content item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/CountryParam' },
          { $ref: '#/components/parameters/ContentResourceParam' },
          { $ref: '#/components/parameters/ContentIdParam' },
        ],
        responses: {
          200: {
            description: 'Content item found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContentItem' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Admin - Content'],
        summary: 'Update content item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/CountryParam' },
          { $ref: '#/components/parameters/ContentResourceParam' },
          { $ref: '#/components/parameters/ContentIdParam' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContentItemRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Content item updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContentItem' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Admin - Content'],
        summary: 'Delete content item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/CountryParam' },
          { $ref: '#/components/parameters/ContentResourceParam' },
          { $ref: '#/components/parameters/ContentIdParam' },
        ],
        responses: {
          204: { description: 'Content item deleted' },
        },
      },
    },
    '/admin/content/{country}/contacts': {
      get: {
        tags: ['Admin - Contacts'],
        summary: 'List contact submissions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/AdminCountryParam' },
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { $ref: '#/components/parameters/ContactStatusParam' },
        ],
        responses: {
          200: {
            description: 'Contact submission list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactListResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/content/{country}/contacts/{id}': {
      get: {
        tags: ['Admin - Contacts'],
        summary: 'Get contact submission',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/CountryParam' },
          { $ref: '#/components/parameters/ContentIdParam' },
        ],
        responses: {
          200: {
            description: 'Contact submission found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactSubmission' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Admin - Contacts'],
        summary: 'Delete contact submission',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/CountryParam' },
          { $ref: '#/components/parameters/ContentIdParam' },
        ],
        responses: {
          204: { description: 'Contact submission deleted' },
        },
      },
    },
    '/admin/content/{country}/contacts/{id}/status': {
      patch: {
        tags: ['Admin - Contacts'],
        summary: 'Update contact submission status',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/CountryParam' },
          { $ref: '#/components/parameters/ContentIdParam' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateContactStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Contact submission updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactSubmission' },
              },
            },
          },
        },
      },
    },
    '/public/{country}/contact': {
      post: {
        tags: ['Public - Contact'],
        summary: 'Create a public contact submission',
        parameters: [{ $ref: '#/components/parameters/CountryParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PublicContactRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Contact submission created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactSubmission' },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = { openApiSpec };
