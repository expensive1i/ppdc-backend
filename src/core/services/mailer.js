const nodemailer = require('nodemailer');

const { env } = require('../../config/env');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: {
      address: env.SMTP_FROM_EMAIL,
      name: env.SMTP_FROM_NAME,
    },
    to,
    subject,
    html,
    text,
  });
}

module.exports = { sendMail };
