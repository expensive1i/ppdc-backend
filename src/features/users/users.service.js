const bcrypt = require('bcryptjs');

const { AppError } = require('../../core/errors/app-error');
const { prisma } = require('../../db/prisma');

const userPublicSelect = {
	id: true,
	firstName: true,
	lastName: true,
	email: true,
	role: true,
	allPlatforms: true,
	countryScopes: true,
	createdAt: true,
	updatedAt: true,
};

function normalizeAccessScope(accessScope) {
	if (accessScope.allPlatforms) {
		return {
			allPlatforms: true,
			countries: [],
		};
	}

	return {
		allPlatforms: false,
		countries: [...new Set(accessScope.countries)],
	};
}

function mapUserToPublic(user) {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		role: user.role,
		accessScope: {
			allPlatforms: user.allPlatforms,
			countries: user.countryScopes,
		},
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

async function ensureEmailIsAvailable(email) {
	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});

	if (existingUser) {
		throw new AppError('A user with this email already exists', 409);
	}
}

async function createUser(data) {
	await ensureEmailIsAvailable(data.email);

	const passwordHash = await bcrypt.hash(data.password, 12);
	const accessScope = normalizeAccessScope(data.accessScope);
	const createdUser = await prisma.user.create({
		data: {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			role: data.role,
			allPlatforms: accessScope.allPlatforms,
			countryScopes: accessScope.countries,
			passwordHash,
		},
		select: userPublicSelect,
	});

	return mapUserToPublic(createdUser);
}

async function listUsers() {
	const users = await prisma.user.findMany({
		select: userPublicSelect,
		orderBy: {
			createdAt: 'desc',
		},
	});

	return users.map(mapUserToPublic);
}

async function getUserById(userId) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: userPublicSelect,
	});

	if (!user) {
		throw new AppError('User not found', 404);
	}

	return mapUserToPublic(user);
}

module.exports = { createUser, getUserById, listUsers, mapUserToPublic, userPublicSelect };
