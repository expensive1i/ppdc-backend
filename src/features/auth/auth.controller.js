const authService = require('./auth.service');

async function register(req, res) {
  const result = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
}

async function login(req, res) {
  const result = await authService.loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
}

module.exports = {
  register,
  login,
};
