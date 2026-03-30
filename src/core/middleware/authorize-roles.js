const { AppError } = require('../errors/app-error');

function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.auth?.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.auth.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    return next();
  };
}

module.exports = { authorizeRoles };
