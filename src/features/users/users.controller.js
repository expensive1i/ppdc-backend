const userService = require('./users.service');

async function createUser(req, res) {
  const user = await userService.createUser(req.body);

  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
}

async function listUsers(req, res) {
  const users = await userService.listUsers();

  return res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: users,
  });
}

async function getUserById(req, res) {
  const user = await userService.getUserById(req.params.userId);

  return res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
}

module.exports = { createUser, listUsers, getUserById };
