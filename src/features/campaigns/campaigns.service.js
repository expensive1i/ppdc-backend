const { Prisma } = require('@prisma/client');
const { AppError } = require('../../core/errors/app-error');
const { prisma } = require('../../db/prisma');
const {
  CAMPAIGN_STATUS_ENUM_BY_VALUE,
  CAMPAIGN_STATUS_VALUE_BY_ENUM,
} = require('./campaigns.constants');

const campaignSelect = {
  id: true,
  campaignCode: true,
  title: true,
  beneficiaryName: true,
  shortSummary: true,
  story: true,
  currency: true,
  status: true,
  goalAmount: true,
  totalFundsRaised: true,
  paystackSubAcctCode: true,
  showProgressPublicly: true,
  isDisabled: true,
  imageUrls: true,
  createdAt: true,
  updatedAt: true,
};

function normalizeCampaign(raw) {
  return {
    ...raw,
    status: CAMPAIGN_STATUS_VALUE_BY_ENUM[raw.status] ?? raw.status.toLowerCase(),
  };
}

function encodeStatus(status) {
  if (!status) return undefined;
  return CAMPAIGN_STATUS_ENUM_BY_VALUE[status] ?? status.toUpperCase();
}

async function listCampaigns(query) {
  const { page = 1, limit = 10, search = '', status } = query ?? {};
  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { campaignCode: { contains: search, mode: 'insensitive' } },
            { beneficiaryName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(status ? { status: encodeStatus(status) } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      select: campaignSelect,
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ]);

  return {
    data: items.map(normalizeCampaign),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function createCampaign(payload, actor) {
  const { status, ...rest } = payload;

  const existing = await prisma.campaign.findUnique({
    where: { campaignCode: rest.campaignCode },
    select: { id: true },
  });

  if (existing) {
    throw new AppError('A campaign with this campaign code already exists', 409);
  }

  const item = await prisma.campaign.create({
    select: campaignSelect,
    data: {
      ...rest,
      status: encodeStatus(status ?? 'draft'),
      ...(actor?.id ? { createdById: actor.id, updatedById: actor.id } : {}),
    },
  });

  return normalizeCampaign(item);
}

async function getCampaign(id) {
  const item = await prisma.campaign.findUnique({
    select: campaignSelect,
    where: { id },
  });

  if (!item) {
    throw new AppError('Campaign not found', 404);
  }

  return normalizeCampaign(item);
}

async function updateCampaign(id, payload, actor) {
  const existing = await prisma.campaign.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw new AppError('Campaign not found', 404);
  }

  const { status, campaignCode, ...rest } = payload;

  // Check code uniqueness if changing it
  if (campaignCode) {
    const codeConflict = await prisma.campaign.findFirst({
      where: { campaignCode, NOT: { id } },
      select: { id: true },
    });

    if (codeConflict) {
      throw new AppError('A campaign with this campaign code already exists', 409);
    }
  }

  const item = await prisma.campaign.update({
    select: campaignSelect,
    where: { id },
    data: {
      ...rest,
      ...(campaignCode ? { campaignCode } : {}),
      ...(status ? { status: encodeStatus(status) } : {}),
      ...(actor?.id ? { updatedById: actor.id } : {}),
    },
  });

  return normalizeCampaign(item);
}

async function deleteCampaign(id) {
  const existing = await prisma.campaign.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw new AppError('Campaign not found', 404);
  }

  await prisma.campaign.delete({ where: { id } });
}

async function toggleCampaignDisabled(id, actor) {
  const existing = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true, isDisabled: true },
  });

  if (!existing) {
    throw new AppError('Campaign not found', 404);
  }

  const item = await prisma.campaign.update({
    select: campaignSelect,
    where: { id },
    data: {
      isDisabled: !existing.isDisabled,
      ...(actor?.id ? { updatedById: actor.id } : {}),
    },
  });

  return normalizeCampaign(item);
}

module.exports = {
  listCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignDisabled,
};
