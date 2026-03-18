const { AppError } = require('../errors/app-error');

function errorHandler(error, req, res, _next) {
  req.log.error({ err: error }, 'Request failed');

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
      requestId: req.id,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    requestId: req.id,
  });
}

module.exports = { errorHandler };
