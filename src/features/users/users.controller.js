const { sendMail } = require('../../core/services/mailer');
const { buildWelcomeUserEmail } = require('./users.email');
const userService = require('./users.service');

async function createUser(req, res) {
  const user = await userService.createUser(req.body);

  let welcomeEmailSent = false;

  try {
    const emailContent = buildWelcomeUserEmail({
      user,
      password: req.body.password,
    });

    await sendMail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    welcomeEmailSent = true;
  } catch (error) {
    req.log.error({ err: error, email: user.email }, 'Failed to send welcome email to new user');
  }

  return res.status(201).json({
    ...user,
    welcomeEmailSent,
  });
}

async function listUsers(req, res) {
  const users = await userService.listUsers(req.validated?.query || req.query);

  return res.status(200).json(users);
}

async function getUserById(req, res) {
  const user = await userService.getUserById(req.params.userId);

  return res.status(200).json(user);
}

async function updateUser(req, res) {
  const user = await userService.updateUser(req.params.userId, req.body);

  return res.status(200).json(user);
}

async function updateUserStatus(req, res) {
  const user = await userService.updateUserStatus(req.params.userId, req.body.isActive, req.auth.user.id);

  return res.status(200).json(user);
}

async function deleteUser(req, res) {
  await userService.deleteUser(req.params.userId, req.auth.user.id);

  return res.status(204).send();
}

module.exports = { createUser, deleteUser, getUserById, listUsers, updateUser, updateUserStatus };
