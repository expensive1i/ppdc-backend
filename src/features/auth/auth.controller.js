function register(req, res) {
  return res.status(501).json({
    success: false,
    message: 'Not implemented: register',
  });
}

function login(req, res) {
  return res.status(501).json({
    success: false,
    message: 'Not implemented: login',
  });
}

module.exports = {
  register,
  login,
};
