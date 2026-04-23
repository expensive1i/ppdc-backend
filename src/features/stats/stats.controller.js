const { getDashboardStats } = require('./stats.service');

async function listStats(req, res) {
  const result = await getDashboardStats(req.query);
  return res.status(200).json(result);
}

module.exports = { listStats };
