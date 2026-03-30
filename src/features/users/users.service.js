const bcrypt = require('bcryptjs');

const { AppError } = require('../../core/errors/app-error');
const { prisma } = require('../../db/prisma');
const { COUNTRY_SCOPE_BY_REGION, REGION_BY_COUNTRY_SCOPE } = require('./users.constants');

const userPublicSelect = {
	id: true,
	firstName: true,
	lastName: true,
	email: true,
	role: true,
	allPlatforms: true,
	countryScopes: true,
	isActive: true,
	createdAt: true,
	updatedAt: true,
};

function mapManagedRegionsToDb(managedRegions) {
	if (managedRegions.includes('all')) {
		return {
			allPlatforms: true,
			countryScopes: [],
		};
	}

	return {
		allPlatforms: false,
		countryScopes: managedRegions.map((region) => COUNTRY_SCOPE_BY_REGION[region]),
	};
}

function mapManagedRegionsFromDb(user) {
	if (user.allPlatforms) {
		return ['all'];
	}

	return user.countryScopes.map((countryScope) => REGION_BY_COUNTRY_SCOPE[countryScope]);
}

function mapUserToPublic(user) {
	return {
		id: user.id,
		name: `${user.firstName} ${user.lastName}`,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		role: user.role,
		managedRegions: mapManagedRegionsFromDb(user),
		isActive: user.isActive,
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

async function ensureEmailBelongsToCurrentUserOrIsAvailable(email, userId) {
	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});

	if (existingUser && existingUser.id !== userId) {
		throw new AppError('A user with this email already exists', 409);
	}
}

async function createUser(data) {
	await ensureEmailIsAvailable(data.email);

	const passwordHash = await bcrypt.hash(data.password, 12);
	const dbManagedRegions = mapManagedRegionsToDb(data.managedRegions);
	const createdUser = await prisma.user.create({
		data: {
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			role: data.role,
			allPlatforms: dbManagedRegions.allPlatforms,
			countryScopes: dbManagedRegions.countryScopes,
			isActive: true,
			passwordHash,
		},
		select: userPublicSelect,
	});

	return mapUserToPublic(createdUser);
}

function buildUserListWhere(query) {
	const where = {};

	if (query.search) {
		where.OR = [
			{ firstName: { contains: query.search, mode: 'insensitive' } },
			{ lastName: { contains: query.search, mode: 'insensitive' } },
			{ email: { contains: query.search, mode: 'insensitive' } },
		];
	}

	if (query.region === 'all') {
		where.allPlatforms = true;
	}

	if (query.region && query.region !== 'all') {
		where.AND = [
			...(where.AND || []),
			{
				OR: [
					{ allPlatforms: true },
					{ countryScopes: { has: COUNTRY_SCOPE_BY_REGION[query.region] } },
				],
			},
		];
	}

	return where;
}

async function listUsers(query) {
	const where = buildUserListWhere(query);
	const [total, users] = await Promise.all([
		prisma.user.count({ where }),
		prisma.user.findMany({
		select: userPublicSelect,
		where,
		skip: (query.page - 1) * query.limit,
		take: query.limit,
		orderBy: {
			[query.sortBy]: query.sortOrder,
		},
		}),
	]);

	return {
		data: users.map(mapUserToPublic),
		meta: {
			page: query.page,
			limit: query.limit,
			total,
			totalPages: Math.ceil(total / query.limit) || 1,
		},
	};
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

async function updateUser(userId, data) {
	await getUserById(userId);

	if (data.email) {
		await ensureEmailBelongsToCurrentUserOrIsAvailable(data.email, userId);
	}

	const updateData = {
		...(data.firstName ? { firstName: data.firstName } : {}),
		...(data.lastName ? { lastName: data.lastName } : {}),
		...(data.email ? { email: data.email } : {}),
		...(data.role ? { role: data.role } : {}),
	};

	if (data.managedRegions) {
		const dbManagedRegions = mapManagedRegionsToDb(data.managedRegions);
		updateData.allPlatforms = dbManagedRegions.allPlatforms;
		updateData.countryScopes = dbManagedRegions.countryScopes;
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: updateData,
		select: userPublicSelect,
	});

	return mapUserToPublic(updatedUser);
}

async function updateUserStatus(userId, isActive) {
	await getUserById(userId);

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: { isActive },
		select: userPublicSelect,
	});

	return mapUserToPublic(updatedUser);
}

async function deleteUser(userId) {
	await getUserById(userId);

	await prisma.user.delete({
		where: { id: userId },
	});
}

module.exports = {
	createUser,
	deleteUser,
	getUserById,
	listUsers,
	mapManagedRegionsFromDb,
	mapManagedRegionsToDb,
	mapUserToPublic,
	updateUser,
	updateUserStatus,
	userPublicSelect,
};
