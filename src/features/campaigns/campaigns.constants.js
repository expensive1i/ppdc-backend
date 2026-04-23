const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'running', 'closed'];

const CAMPAIGN_STATUS_ENUM_BY_VALUE = {
  draft: 'DRAFT',
  scheduled: 'SCHEDULED',
  running: 'RUNNING',
  closed: 'CLOSED',
};

const CAMPAIGN_STATUS_VALUE_BY_ENUM = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  RUNNING: 'running',
  CLOSED: 'closed',
};

module.exports = {
  CAMPAIGN_STATUSES,
  CAMPAIGN_STATUS_ENUM_BY_VALUE,
  CAMPAIGN_STATUS_VALUE_BY_ENUM,
};
