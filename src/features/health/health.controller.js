const { env } = require('../../config/env');

function getHealth(req, res) {
  return res.status(200).json({
    success: true,
    message: 'OK',
    data: {
      status: 'healthy',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { getHealth };
