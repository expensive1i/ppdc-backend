const jwt = require('jsonwebtoken');

const { env } = require('../../config/env');
const { AppError } = require('../errors/app-error');
const { prisma } = require('../../db/prisma');
const { mapUserToPublic, userPublicSelect } = require('../../features/users/users.service');

async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return next(new AppError('Authentication required', 401));
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: userPublicSelect,
    });

    if (!user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!user.isActive) {
      return next(new AppError('User account is inactive', 403));
    }

    req.auth = {
      token,
      sessionId: payload.sid,
      user: mapUserToPublic(user),
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Authentication required', 401));
    }

    return next(error);
  }
}

module.exports = { authenticate };
