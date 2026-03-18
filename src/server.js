const { createApp } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { pool } = require('./db/pool');

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
});

const shutdown = async (signal) => {
  logger.info({ signal }, 'Graceful shutdown started');

  server.close(async () => {
    await pool.end();
    logger.info('HTTP server and DB pool closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000).unref();
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});
