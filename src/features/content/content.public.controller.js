const contentService = require('./content.service');

async function createContactSubmission(req, res) {
  const result = await contentService.createPublicContactSubmission(req.params.country, req.body);

  return res.status(201).json(result);
}

module.exports = { createContactSubmission };
