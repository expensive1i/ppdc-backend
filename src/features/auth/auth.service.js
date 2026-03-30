const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { AppError } = require('../../core/errors/app-error');
const { env } = require('../../config/env');
const { prisma } = require('../../db/prisma');
const { createUser, mapUserToPublic, userPublicSelect } = require('../users/users.service');

function toSeconds(expiresIn) {
	const match = /^(\d+)([smhd])$/.exec(expiresIn);

	if (!match) {
		return 0;
	}

	const value = Number(match[1]);
	const unit = match[2];
	const multipliers = {
		m: 60,
		h: 60 * 60,
		d: 60 * 60 * 24,
		s: 1,
	};

	return value * multipliers[unit];
}

function buildExpiresAt(expiresIn) {
	return new Date(Date.now() + toSeconds(expiresIn) * 1000);
}

function hashToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

function buildAuthPayload(user, sessionId) {
	return {
		sub: user.id,
		email: user.email,
		role: user.role,
		sid: sessionId,
	};
}

function createTokens(user, sessionId) {
	const payload = buildAuthPayload(user, sessionId);

	return {
		accessToken: jwt.sign(payload, env.JWT_ACCESS_SECRET, {
			expiresIn: env.JWT_ACCESS_EXPIRES_IN,
		}),
		refreshToken: jwt.sign(payload, env.JWT_REFRESH_SECRET, {
			expiresIn: env.JWT_REFRESH_EXPIRES_IN,
		}),
		expiresIn: toSeconds(env.JWT_ACCESS_EXPIRES_IN),
	};
}

async function createSession(user, refreshToken) {
	const session = await prisma.userSession.create({
		data: {
			userId: user.id,
			hashedRefreshToken: hashToken(refreshToken),
			expiresAt: buildExpiresAt(env.JWT_REFRESH_EXPIRES_IN),
		},
	});

	return session;
}

async function issueAuthResponse(user) {
	const provisionalSessionId = crypto.randomUUID();
	const provisionalTokens = createTokens(user, provisionalSessionId);
	const session = await createSession(user, provisionalTokens.refreshToken);
	const tokens = createTokens(user, session.id);

	await prisma.userSession.update({
		where: { id: session.id },
		data: {
			hashedRefreshToken: hashToken(tokens.refreshToken),
			expiresAt: buildExpiresAt(env.JWT_REFRESH_EXPIRES_IN),
		},
	});

	return {
		user,
		...tokens,
	};
}

async function registerUser(data) {
	const user = await createUser(data);

	return issueAuthResponse(user);
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

	if (!user.isActive) {
		throw new AppError('User account is inactive', 403);
	}

	const safeUser = mapUserToPublic(user);

	return issueAuthResponse(safeUser);
}

async function getCurrentUser(userId) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: userPublicSelect,
	});

	if (!user) {
		throw new AppError('User not found', 404);
	}

	if (!user.isActive) {
		throw new AppError('User account is inactive', 403);
	}

	return mapUserToPublic(user);
}

async function refreshSession(refreshToken) {
	let payload;

	try {
		payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
	} catch {
		throw new AppError('Invalid refresh token', 401);
	}

	const session = await prisma.userSession.findUnique({
		where: { id: payload.sid },
		include: {
			user: {
				select: {
					...userPublicSelect,
				},
			},
		},
	});

	if (!session || !session.user || session.revokedAt) {
		throw new AppError('Invalid refresh token', 401);
	}

	if (session.expiresAt.getTime() < Date.now()) {
		throw new AppError('Refresh token has expired', 401);
	}

	if (session.hashedRefreshToken !== hashToken(refreshToken)) {
		throw new AppError('Invalid refresh token', 401);
	}

	if (!session.user.isActive) {
		throw new AppError('User account is inactive', 403);
	}

	const safeUser = mapUserToPublic(session.user);
	const tokens = createTokens(safeUser, session.id);

	await prisma.userSession.update({
		where: { id: session.id },
		data: {
			hashedRefreshToken: hashToken(tokens.refreshToken),
			expiresAt: buildExpiresAt(env.JWT_REFRESH_EXPIRES_IN),
			lastUsedAt: new Date(),
			revokedAt: null,
		},
	});

	return {
		user: safeUser,
		...tokens,
	};
}

async function logoutSession(refreshToken) {
	try {
		const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
		await prisma.userSession.updateMany({
			where: {
				id: payload.sid,
				hashedRefreshToken: hashToken(refreshToken),
				revokedAt: null,
			},
			data: {
				revokedAt: new Date(),
			},
		});
	} catch {
		return;
	}
}

module.exports = { getCurrentUser, loginUser, logoutSession, refreshSession, registerUser };
