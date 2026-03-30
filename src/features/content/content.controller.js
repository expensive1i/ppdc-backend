const contentService = require('./content.service');

async function listContentItems(req, res) {
  const result = await contentService.listContentItems(
    req.params.country,
    req.params.resource,
    req.validated?.query || req.query,
    req.auth.user,
  );

  return res.status(200).json(result);
}

async function createContentItem(req, res) {
  const result = await contentService.createContentItem(
    req.params.country,
    req.params.resource,
    req.body,
    req.auth.user,
  );

  return res.status(201).json(result);
}

async function getContentItem(req, res) {
  const result = await contentService.getContentItem(
    req.params.country,
    req.params.resource,
    req.params.id,
    req.auth.user,
  );

  return res.status(200).json(result);
}

async function updateContentItem(req, res) {
  const result = await contentService.updateContentItem(
    req.params.country,
    req.params.resource,
    req.params.id,
    req.body,
    req.auth.user,
  );

  return res.status(200).json(result);
}

async function deleteContentItem(req, res) {
  await contentService.deleteContentItem(
    req.params.country,
    req.params.resource,
    req.params.id,
    req.auth.user,
  );

  return res.status(204).send();
}

async function listContactSubmissions(req, res) {
  const result = await contentService.listContactSubmissions(
    req.params.country,
    req.validated?.query || req.query,
    req.auth.user,
  );

  return res.status(200).json(result);
}

async function getContactSubmission(req, res) {
  const result = await contentService.getContactSubmission(req.params.country, req.params.id, req.auth.user);

  return res.status(200).json(result);
}

async function updateContactSubmissionStatus(req, res) {
  const result = await contentService.updateContactSubmissionStatus(
    req.params.country,
    req.params.id,
    req.body.status,
    req.auth.user,
  );

  return res.status(200).json(result);
}

async function deleteContactSubmission(req, res) {
  await contentService.deleteContactSubmission(req.params.country, req.params.id, req.auth.user);

  return res.status(204).send();
}

module.exports = {
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
