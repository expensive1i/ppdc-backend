const authService = require('./auth.service');

async function forgotPassword(req, res) {
  const result = await authService.requestPasswordReset(req.body.email);

  return res.status(200).json(result);
}

async function register(req, res) {
  const result = await authService.registerUser(req.body);

  return res.status(201).json(result);
}

async function login(req, res) {
  const result = await authService.loginUser(req.body);

  return res.status(200).json(result);
}

async function me(req, res) {
  const user = await authService.getCurrentUser(req.auth.user.id);

  return res.status(200).json(user);
}

async function refresh(req, res) {
  const result = await authService.refreshSession(req.body.refreshToken);

  return res.status(200).json(result);
}

async function verifyResetOtp(req, res) {
  const result = await authService.verifyPasswordResetOtp(req.body);

  return res.status(200).json(result);
}

async function resetPassword(req, res) {
  const result = await authService.resetPassword(req.body);

  return res.status(200).json(result);
}

async function logout(req, res) {
  await authService.logoutSession(req.body.refreshToken);

  return res.status(200).json({
    message: 'Logout successful',
  });
}

module.exports = {
  forgotPassword,
  logout,
  register,
  login,
  me,
  refresh,
  resetPassword,
  verifyResetOtp,
};
