const CONTENT_COUNTRIES = ['uk', 'us', 'nigeria'];
const CONTENT_COUNTRY_FILTERS = ['all', ...CONTENT_COUNTRIES];
const CONTENT_ITEM_RESOURCES = ['blogs', 'updates', 'programs', 'careers', 'hero-contents', 'resources'];
const CONTENT_RESOURCES = [...CONTENT_ITEM_RESOURCES, 'contacts'];
const CONTENT_STATUSES = ['draft', 'published', 'archived'];
const CONTACT_STATUSES = ['new', 'acknowledged'];

const COUNTRY_ENUM_BY_VALUE = {
  uk: 'UK',
  us: 'US',
  nigeria: 'NIGERIA',
};

const COUNTRY_VALUE_BY_ENUM = {
  UK: 'uk',
  US: 'us',
  NIGERIA: 'nigeria',
};

const RESOURCE_ENUM_BY_VALUE = {
  blogs: 'BLOGS',
  updates: 'UPDATES',
  programs: 'PROGRAMS',
  careers: 'CAREERS',
  'hero-contents': 'HERO_CONTENTS',
  resources: 'RESOURCES',
};

const RESOURCE_VALUE_BY_ENUM = {
  BLOGS: 'blogs',
  UPDATES: 'updates',
  PROGRAMS: 'programs',
  CAREERS: 'careers',
  HERO_CONTENTS: 'hero-contents',
  RESOURCES: 'resources',
};

const CONTENT_STATUS_ENUM_BY_VALUE = {
  draft: 'DRAFT',
  published: 'PUBLISHED',
  archived: 'ARCHIVED',
};

const CONTENT_STATUS_VALUE_BY_ENUM = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

const CONTACT_STATUS_ENUM_BY_VALUE = {
  new: 'NEW',
  acknowledged: 'ACKNOWLEDGED',
};

const CONTACT_STATUS_VALUE_BY_ENUM = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
};

const COUNTRY_RESOURCE_MATRIX = {
  uk: ['blogs', 'updates', 'programs', 'careers', 'contacts'],
  us: ['blogs', 'updates', 'programs', 'careers', 'contacts'],
  nigeria: ['blogs', 'updates', 'programs', 'careers', 'contacts', 'hero-contents', 'resources'],
};

module.exports = {
  CONTACT_STATUSES,
  CONTACT_STATUS_ENUM_BY_VALUE,
  CONTACT_STATUS_VALUE_BY_ENUM,
  CONTENT_COUNTRY_FILTERS,
  CONTENT_COUNTRIES,
  CONTENT_ITEM_RESOURCES,
  CONTENT_RESOURCES,
  CONTENT_STATUSES,
  CONTENT_STATUS_ENUM_BY_VALUE,
  CONTENT_STATUS_VALUE_BY_ENUM,
  COUNTRY_ENUM_BY_VALUE,
  COUNTRY_RESOURCE_MATRIX,
  COUNTRY_VALUE_BY_ENUM,
  RESOURCE_ENUM_BY_VALUE,
  RESOURCE_VALUE_BY_ENUM,
};
