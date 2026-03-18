function listUsers(req, res) {
  return res.status(501).json({
    success: false,
    message: 'Not implemented: list users',
  });
}

function getUserById(req, res) {
  return res.status(501).json({
    success: false,
    message: `Not implemented: get user ${req.params.userId}`,
  });
}

module.exports = { listUsers, getUserById };
