const campaignsService = require('./campaigns.service');

async function listCampaigns(req, res) {
  const result = await campaignsService.listCampaigns(req.validated?.query ?? req.query);
  return res.status(200).json(result);
}

async function createCampaign(req, res) {
  const result = await campaignsService.createCampaign(req.body, req.auth?.user);
  return res.status(201).json(result);
}

async function getCampaign(req, res) {
  const result = await campaignsService.getCampaign(req.params.id);
  return res.status(200).json(result);
}

async function updateCampaign(req, res) {
  const result = await campaignsService.updateCampaign(req.params.id, req.body, req.auth?.user);
  return res.status(200).json(result);
}

async function deleteCampaign(req, res) {
  await campaignsService.deleteCampaign(req.params.id);
  return res.status(204).send();
}

async function toggleCampaignDisabled(req, res) {
  const result = await campaignsService.toggleCampaignDisabled(req.params.id, req.auth?.user);
  return res.status(200).json(result);
}

module.exports = {
  listCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignDisabled,
};
