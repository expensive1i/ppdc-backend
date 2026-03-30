const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { AppError } = require('../../core/errors/app-error');
const { env } = require('../../config/env');
const { prisma } = require('../../db/prisma');
const { createUser, mapUserToPublic, userPublicSelect } = require('../users/users.service');

function buildAuthPayload(user) {
	return {
		sub: user.id,
		email: user.email,
		role: user.role,
	};
}

function createTokens(user) {
	const payload = buildAuthPayload(user);

	return {
		accessToken: jwt.sign(payload, env.JWT_ACCESS_SECRET, {
			expiresIn: env.JWT_ACCESS_EXPIRES_IN,
		}),
		refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, {
			expiresIn: env.JWT_REFRESH_EXPIRES_IN,
		}),
		tokenType: 'Bearer',
		accessTokenExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
		refreshTokenExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
	};
}

async function registerUser(data) {
	const user = await createUser(data);

	return {
		user,
		tokens: createTokens(user),
	};
}

async function loginUser(credentials) {
	const user = await prisma.user.findUnique({
		where: { email: credentials.email },
		select: {
			...userPublicSelect,
			passwordHash: true,
		},
	});

	if (!user) {
		throw new AppError('Invalid email or password', 401);
	}

	const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

	if (!isPasswordValid) {
		throw new AppError('Invalid email or password', 401);
	}

	const safeUser = {
		...mapUserToPublic(user),
	};

	return {
		user: safeUser,
		tokens: createTokens(safeUser),
	};
}

module.exports = { loginUser, registerUser };
