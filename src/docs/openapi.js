const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PPDC Backend API',
    version: '1.0.0',
    description: 'Professional REST API scaffold built with Express and PostgreSQL.',
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local development',
    },
  ],
  tags: [{ name: 'Health' }, { name: 'Auth' }, { name: 'Users' }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
          },
        },
      },
    },
  },
};

module.exports = { openApiSpec };
