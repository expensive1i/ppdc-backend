const { prisma } = require('../../db/prisma');

async function getDashboardStats(query) {
  const { country } = query ?? {};

  // Build country filter for content/contacts
  const contentCountryMap = { uk: 'UK', us: 'US', nigeria: 'NIGERIA' };
  const countryFilter = country && contentCountryMap[country]
    ? { country: contentCountryMap[country] }
    : {};

  const [
    totalBlogs,
    totalPrograms,
    totalUpdates,
    totalCareers,
    totalHeroContents,
    totalResources,
    totalContactSubmissions,
    totalUsers,
    totalCampaigns,
  ] = await Promise.all([
    prisma.contentItem.count({ where: { ...countryFilter, resource: 'BLOGS' } }),
    prisma.contentItem.count({ where: { ...countryFilter, resource: 'PROGRAMS' } }),
    prisma.contentItem.count({ where: { ...countryFilter, resource: 'UPDATES' } }),
    prisma.contentItem.count({ where: { ...countryFilter, resource: 'CAREERS' } }),
    prisma.contentItem.count({ where: { ...countryFilter, resource: 'HERO_CONTENTS' } }),
    prisma.contentItem.count({ where: { ...countryFilter, resource: 'RESOURCES' } }),
    prisma.contactSubmission.count({ where: countryFilter }),
    prisma.user.count(),
    prisma.campaign.count(),
  ]);

  return {
    data: {
      totalBlogs,
      totalPrograms,
      totalUpdates,
      totalCareers,
      totalHeroContents,
      totalResources,
      totalContentItems:
        totalBlogs + totalPrograms + totalUpdates + totalCareers + totalHeroContents + totalResources,
      totalContactSubmissions,
      totalUsers,
      totalCampaigns,
    },
  };
}

module.exports = { getDashboardStats };
