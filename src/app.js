const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const pinoHttp = require('pino-http');

const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { openApiSpec } = require('./docs/openapi');
const { apiRouter } = require('./routes');
const { notFoundHandler } = require('./core/middleware/not-found');
const { errorHandler } = require('./core/middleware/error-handler');

function createApp() {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.headers['x-request-id'] || undefined,
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
