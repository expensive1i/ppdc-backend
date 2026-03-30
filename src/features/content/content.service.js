const sanitizeHtml = require('sanitize-html');
const { Prisma } = require('@prisma/client');

const { AppError } = require('../../core/errors/app-error');
const { prisma } = require('../../db/prisma');
const {
  CONTACT_STATUS_ENUM_BY_VALUE,
  CONTACT_STATUS_VALUE_BY_ENUM,
  CONTENT_COUNTRIES,
  CONTENT_STATUS_ENUM_BY_VALUE,
  CONTENT_STATUS_VALUE_BY_ENUM,
  COUNTRY_ENUM_BY_VALUE,
  COUNTRY_RESOURCE_MATRIX,
  COUNTRY_VALUE_BY_ENUM,
  RESOURCE_ENUM_BY_VALUE,
  RESOURCE_VALUE_BY_ENUM,
} = require('./content.constants');

const contentItemSelect = {
  id: true,
  country: true,
  resource: true,
  title: true,
  slug: true,
  type: true,
  category: true,
  tags: true,
  summary: true,
  description: true,
  imageUrl: true,
  author: true,
  publishDate: true,
  readingTime: true,
  content: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const contactSubmissionSelect = {
  id: true,
  country: true,
  name: true,
  email: true,
  subject: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

function assertCountryAccess(user, country) {
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  if (country === 'all') {
    return;
  }

  if (!user.managedRegions.includes('all') && !user.managedRegions.includes(country)) {
    throw new AppError('You do not have access to manage this country', 403);
  }
}

function assertResourceSupported(country, resource) {
  if (country === 'all') {
    const isSupportedSomewhere = CONTENT_COUNTRIES.some((contentCountry) =>
      COUNTRY_RESOURCE_MATRIX[contentCountry]?.includes(resource),
    );

    if (!isSupportedSomewhere) {
      throw new AppError('Resource is not available for this country filter', 404);
    }

    return;
  }

  if (!COUNTRY_RESOURCE_MATRIX[country]?.includes(resource)) {
    throw new AppError('Resource is not available for this country', 404);
  }
}

function resolveAccessibleCountries(actor, country) {
  assertCountryAccess(actor, country);

  if (country === 'all') {
    if (actor.managedRegions.includes('all')) {
      return CONTENT_COUNTRIES;
    }

    return actor.managedRegions.filter((region) => CONTENT_COUNTRIES.includes(region));
  }

  return [country];
}

function normalizeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function sanitizeRichText(content) {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'iframe',
      'figure',
      'figcaption',
      'span',
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
      '*': ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
  }).trim();
}

function buildPublishDate(value) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function formatPublishDate(value) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function mapContentItem(record) {
  return {
    id: record.id,
    country: COUNTRY_VALUE_BY_ENUM[record.country],
    resource: RESOURCE_VALUE_BY_ENUM[record.resource],
    title: record.title,
    slug: record.slug,
    type: record.type,
    category: record.category,
    tags: record.tags,
    summary: record.summary,
    description: record.description,
    imageUrl: record.imageUrl,
    author: record.author,
    publishDate: formatPublishDate(record.publishDate),
    readingTime: record.readingTime,
    content: record.content,
    status: CONTENT_STATUS_VALUE_BY_ENUM[record.status],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapContactSubmission(record) {
  return {
    id: record.id,
    country: COUNTRY_VALUE_BY_ENUM[record.country],
    name: record.name,
    email: record.email,
    subject: record.subject,
    message: record.message,
    status: CONTACT_STATUS_VALUE_BY_ENUM[record.status],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildContentWhere(dbCountries, dbResource, query) {
  const where = {
    resource: dbResource,
  };

  if (dbCountries.length === 1) {
    where.country = dbCountries[0];
  } else {
    where.country = { in: dbCountries };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } },
      { summary: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { category: { contains: query.search, mode: 'insensitive' } },
      { type: { contains: query.search, mode: 'insensitive' } },
      { author: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.category) {
    where.category = { equals: query.category, mode: 'insensitive' };
  }

  if (query.type) {
    where.type = { equals: query.type, mode: 'insensitive' };
  }

  if (query.status) {
    where.status = CONTENT_STATUS_ENUM_BY_VALUE[query.status];
  }

  return where;
}

function buildContactWhere(dbCountries, query) {
  const where = {};

  if (dbCountries.length === 1) {
    where.country = dbCountries[0];
  } else {
    where.country = { in: dbCountries };
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { subject: { contains: query.search, mode: 'insensitive' } },
      { message: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.status) {
    where.status = CONTACT_STATUS_ENUM_BY_VALUE[query.status];
  }

  return where;
}

function buildContentCreateData(payload, actor) {
  const sanitizedContent = sanitizeRichText(payload.content);

  if (!sanitizedContent) {
    throw new AppError('Content body cannot be empty after sanitization', 400);
  }

  return {
    title: payload.title.trim(),
    slug: normalizeSlug(payload.slug || payload.title),
    type: payload.type.trim(),
    category: payload.category.trim(),
    tags: payload.tags,
    summary: payload.summary.trim(),
    description: payload.description?.trim() || null,
    imageUrl: payload.imageUrl,
    author: payload.author?.trim() || actor.name,
    publishDate: buildPublishDate(payload.publishDate),
    readingTime: payload.readingTime.trim(),
    content: sanitizedContent,
    status: CONTENT_STATUS_ENUM_BY_VALUE[payload.status],
    createdById: actor.id,
    updatedById: actor.id,
  };
}

function buildContentUpdateData(payload, actor) {
  const updateData = {
    updatedById: actor.id,
  };

  if (payload.title !== undefined) {
    updateData.title = payload.title.trim();
  }

  if (payload.slug !== undefined) {
    updateData.slug = normalizeSlug(payload.slug || payload.title || '');
  }

  if (payload.type !== undefined) {
    updateData.type = payload.type.trim();
  }

  if (payload.category !== undefined) {
    updateData.category = payload.category.trim();
  }

  if (payload.tags !== undefined) {
    updateData.tags = payload.tags;
  }

  if (payload.summary !== undefined) {
    updateData.summary = payload.summary.trim();
  }

  if (payload.description !== undefined) {
    updateData.description = payload.description?.trim() || null;
  }

  if (payload.imageUrl !== undefined) {
    updateData.imageUrl = payload.imageUrl;
  }

  if (payload.author !== undefined) {
    updateData.author = payload.author?.trim() || actor.name;
  }

  if (payload.publishDate !== undefined) {
    updateData.publishDate = buildPublishDate(payload.publishDate);
  }

  if (payload.readingTime !== undefined) {
    updateData.readingTime = payload.readingTime.trim();
  }

  if (payload.content !== undefined) {
    const sanitizedContent = sanitizeRichText(payload.content);

    if (!sanitizedContent) {
      throw new AppError('Content body cannot be empty after sanitization', 400);
    }

    updateData.content = sanitizedContent;
  }

  if (payload.status !== undefined) {
    updateData.status = CONTENT_STATUS_ENUM_BY_VALUE[payload.status];
  }

  if (!updateData.slug && updateData.title) {
    updateData.slug = normalizeSlug(updateData.title);
  }

  return updateData;
}

function handlePrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new AppError('A content item with this slug already exists for the selected country and resource', 409);
  }

  throw error;
}

async function listContentItems(country, resource, query, actor) {
  assertResourceSupported(country, resource);

  if (resource === 'contacts') {
    return listContactSubmissions(country, query, actor);
  }

  const countries = resolveAccessibleCountries(actor, country);
  const dbCountries = countries.map((contentCountry) => COUNTRY_ENUM_BY_VALUE[contentCountry]);
  const dbResource = RESOURCE_ENUM_BY_VALUE[resource];
  const where = buildContentWhere(dbCountries, dbResource, query);

  const [total, items] = await Promise.all([
    prisma.contentItem.count({ where }),
    prisma.contentItem.findMany({
      where,
      select: contentItemSelect,
      orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    data: items.map(mapContentItem),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

async function createContentItem(country, resource, payload, actor) {
  assertCountryAccess(actor, country);
  assertResourceSupported(country, resource);

  const dbCountry = COUNTRY_ENUM_BY_VALUE[country];
  const dbResource = RESOURCE_ENUM_BY_VALUE[resource];

  try {
    const item = await prisma.contentItem.create({
      data: {
        country: dbCountry,
        resource: dbResource,
        ...buildContentCreateData(payload, actor),
      },
      select: contentItemSelect,
    });

    return mapContentItem(item);
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getContentItem(country, resource, id, actor) {
  assertCountryAccess(actor, country);
  assertResourceSupported(country, resource);

  const item = await prisma.contentItem.findFirst({
    where: {
      id,
      country: COUNTRY_ENUM_BY_VALUE[country],
      resource: RESOURCE_ENUM_BY_VALUE[resource],
    },
    select: contentItemSelect,
  });

  if (!item) {
    throw new AppError('Content item not found', 404);
  }

  return mapContentItem(item);
}

async function updateContentItem(country, resource, id, payload, actor) {
  await getContentItem(country, resource, id, actor);

  try {
    const item = await prisma.contentItem.update({
      where: { id },
      data: buildContentUpdateData(payload, actor),
      select: contentItemSelect,
    });

    return mapContentItem(item);
  } catch (error) {
    handlePrismaError(error);
  }
}

async function deleteContentItem(country, resource, id, actor) {
  await getContentItem(country, resource, id, actor);

  await prisma.contentItem.delete({
    where: { id },
  });
}

async function listContactSubmissions(country, query, actor) {
  assertResourceSupported(country, 'contacts');

  const countries = resolveAccessibleCountries(actor, country);
  const dbCountries = countries.map((contentCountry) => COUNTRY_ENUM_BY_VALUE[contentCountry]);
  const where = buildContactWhere(dbCountries, query);

  const [total, items] = await Promise.all([
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.findMany({
      where,
      select: contactSubmissionSelect,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    data: items.map(mapContactSubmission),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

async function getContactSubmission(country, id, actor) {
  assertCountryAccess(actor, country);
  assertResourceSupported(country, 'contacts');

  const item = await prisma.contactSubmission.findFirst({
    where: {
      id,
      country: COUNTRY_ENUM_BY_VALUE[country],
    },
    select: contactSubmissionSelect,
  });

  if (!item) {
    throw new AppError('Contact submission not found', 404);
  }

  return mapContactSubmission(item);
}

async function updateContactSubmissionStatus(country, id, status, actor) {
  await getContactSubmission(country, id, actor);

  const item = await prisma.contactSubmission.update({
    where: { id },
    data: {
      status: CONTACT_STATUS_ENUM_BY_VALUE[status],
    },
    select: contactSubmissionSelect,
  });

  return mapContactSubmission(item);
}

async function deleteContactSubmission(country, id, actor) {
  await getContactSubmission(country, id, actor);

  await prisma.contactSubmission.delete({
    where: { id },
  });
}

async function createPublicContactSubmission(country, payload) {
  assertResourceSupported(country, 'contacts');

  const item = await prisma.contactSubmission.create({
    data: {
      country: COUNTRY_ENUM_BY_VALUE[country],
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      status: CONTACT_STATUS_ENUM_BY_VALUE.new,
    },
    select: contactSubmissionSelect,
  });

  return mapContactSubmission(item);
}

module.exports = {
  createPublicContactSubmission,
  createContentItem,
  deleteContactSubmission,
  deleteContentItem,
  getContactSubmission,
  getContentItem,
  listContactSubmissions,
  listContentItems,
  updateContactSubmissionStatus,
  updateContentItem,
};
