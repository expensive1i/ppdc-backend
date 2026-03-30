const { ZodError } = require('zod');

const { AppError } = require('../errors/app-error');

function mapZodIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

function validateRequest(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError('Validation failed', 400, mapZodIssues(error.issues)));
      }

      return next(error);
    }
  };
}

module.exports = { validateRequest };
