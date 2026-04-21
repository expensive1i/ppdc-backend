const USER_ROLES = ['ADMIN', 'USER'];
const MANAGED_REGIONS = ['all', 'uk', 'us', 'nigeria'];
const MANAGEMENT_AREAS = ['USER_MANAGEMENT', 'CAMPAIGN_MANAGEMENT'];

const COUNTRY_SCOPE_BY_REGION = {
  uk: 'UNITED_KINGDOM',
  us: 'UNITED_STATES',
  nigeria: 'NIGERIA',
};

const REGION_BY_COUNTRY_SCOPE = {
  UNITED_KINGDOM: 'uk',
  UNITED_STATES: 'us',
  NIGERIA: 'nigeria',
};

const USER_SORT_FIELDS = ['createdAt', 'email', 'firstName', 'lastName'];

module.exports = {
  COUNTRY_SCOPE_BY_REGION,
  MANAGED_REGIONS,
  MANAGEMENT_AREAS,
  REGION_BY_COUNTRY_SCOPE,
  USER_ROLES,
  USER_SORT_FIELDS,
};
