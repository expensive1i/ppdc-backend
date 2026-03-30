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
      req.validated = req.validated || {};

      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body);
        req.body = parsedBody;
        req.validated.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        req.params = parsedParams;
        req.validated.params = parsedParams;
      }

      if (schemas.query) {
        req.validated.query = schemas.query.parse(req.query);
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
