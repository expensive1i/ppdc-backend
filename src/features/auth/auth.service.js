const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { AppError } = require('../../core/errors/app-error');
const { env } = require('../../config/env');
const { prisma } = require('../../db/prisma');
const { sendMail } = require('../../core/services/mailer');
const { createUser, mapUserToPublic, userPublicSelect } = require('../users/users.service');

const PASSWORD_RESET_OTP_TTL_MINUTES = 15;

function hashValue(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}

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
	return hashValue(token);
}

function generateOtp() {
	return crypto.randomInt(100000, 1000000).toString();
}

function buildPasswordResetExpiry() {
	return new Date(Date.now() + PASSWORD_RESET_OTP_TTL_MINUTES * 60 * 1000);
}

function buildResetEmailHtml({ firstName, otp }) {
	return `
		<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
			<p>Hello ${firstName || 'there'},</p>
			<p>We received a request to reset your PPDC Admin password.</p>
			<p>Your one-time password is:</p>
			<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0b4f4a;">${otp}</p>
			<p>This code expires in ${PASSWORD_RESET_OTP_TTL_MINUTES} minutes.</p>
			<p>If you did not request this password reset, you can ignore this email.</p>
			<p style="margin-top: 24px;">PPDC Support Team</p>
		</div>
	`;
}

async function createPasswordResetOtp(user) {
	const otp = generateOtp();

	await prisma.passwordResetToken.updateMany({
		where: {
			userId: user.id,
			usedAt: null,
		},
		data: {
			usedAt: new Date(),
		},
	});

	await prisma.passwordResetToken.create({
		data: {
			userId: user.id,
			hashedOtp: hashValue(otp),
			expiresAt: buildPasswordResetExpiry(),
		},
	});

	return otp;
}

async function getValidPasswordResetToken(email, otp) {
	const user = await prisma.user.findUnique({
		where: { email },
		select: {
			...userPublicSelect,
			firstName: true,
			lastName: true,
			passwordHash: true,
		},
	});

	if (!user) {
		throw new AppError('Invalid reset code or email', 400);
	}

	if (!user.isActive) {
		throw new AppError('User account is inactive', 403);
	}

	const token = await prisma.passwordResetToken.findFirst({
		where: {
			userId: user.id,
			hashedOtp: hashValue(otp),
			usedAt: null,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	if (!token) {
		throw new AppError('Invalid reset code or email', 400);
	}

	if (token.expiresAt.getTime() < Date.now()) {
		throw new AppError('Reset code has expired', 400);
	}

	return { token, user };
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

async function requestPasswordReset(email) {
	const user = await prisma.user.findUnique({
		where: { email },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			isActive: true,
		},
	});

	if (!user || !user.isActive) {
		return {
			message: 'If an account with that email exists, a reset code has been sent.',
		};
	}

	const otp = await createPasswordResetOtp(user);

	await sendMail({
		to: user.email,
		subject: 'PPDC Admin password reset code',
		html: buildResetEmailHtml({
			firstName: user.firstName,
			otp,
		}),
		text: `Your PPDC Admin password reset code is ${otp}. It expires in ${PASSWORD_RESET_OTP_TTL_MINUTES} minutes.`,
	});

	return {
		message: 'If an account with that email exists, a reset code has been sent.',
		verificationExpiresInMinutes: PASSWORD_RESET_OTP_TTL_MINUTES,
	};
}

async function verifyPasswordResetOtp(payload) {
	await getValidPasswordResetToken(payload.email, payload.otp);

	return {
		message: 'Reset code verified successfully.',
		verified: true,
	};
}

async function resetPassword(payload) {
	const { token, user } = await getValidPasswordResetToken(payload.email, payload.otp);
	const passwordHash = await bcrypt.hash(payload.password, 12);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: user.id },
			data: { passwordHash },
		}),
		prisma.passwordResetToken.update({
			where: { id: token.id },
			data: { usedAt: new Date() },
		}),
		prisma.userSession.updateMany({
			where: { userId: user.id, revokedAt: null },
			data: { revokedAt: new Date() },
		}),
	]);

	return {
		message: 'Password reset successful. Please sign in with your new password.',
	};
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

module.exports = {
	getCurrentUser,
	loginUser,
	logoutSession,
	refreshSession,
	registerUser,
	requestPasswordReset,
	resetPassword,
	verifyPasswordResetOtp,
};
