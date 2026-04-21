const { env } = require('../../config/env');

const regionLabels = {
  all: 'All Platforms',
  uk: 'United Kingdom',
  us: 'United States',
  nigeria: 'Nigeria',
};

const managementAreaLabels = {
  USER_MANAGEMENT: 'User Management',
  CAMPAIGN_MANAGEMENT: 'Campaign Management',
};

function formatManagedRegions(managedRegions) {
  return managedRegions.map((region) => regionLabels[region] || region);
}

function formatManagementAreas(managementAreas) {
  return managementAreas.map((area) => managementAreaLabels[area] || area);
}

function buildWelcomeUserEmail({ user, password }) {
  const managedRegions = formatManagedRegions(user.managedRegions);
  const managementAreas = formatManagementAreas(user.managementAreas || []);
  const hasManagementAreas = managementAreas.length > 0;
  const loginUrl = `${env.ADMIN_APP_URL.replace(/\/$/, '')}/login`;
  const scopeListHtml = managedRegions
    .map(
      (region) => `
        <li style="margin-bottom: 8px; color: #475467;">${region}</li>
      `,
    )
    .join('');
  const managementListHtml = managementAreas
    .map(
      (area) => `
        <li style="margin-bottom: 8px; color: #475467;">${area}</li>
      `,
    )
    .join('');

  const html = `
    <div style="background:#f6f8fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#101828;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e7ec;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(16,24,40,0.08);">
        <div style="background:linear-gradient(135deg,#0b4f4a 0%,#116b64 100%);padding:28px 32px;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.72);font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">PPDC Admin Portal</p>
          <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;font-weight:700;">Welcome to the team</h1>
          <p style="margin:12px 0 0;color:rgba(255,255,255,0.82);font-size:15px;line-height:1.7;">Your administrative account has been created successfully. Below are your sign-in details and assigned permissions.</p>
        </div>

        <div style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;color:#344054;line-height:1.7;">Hello ${user.firstName},</p>
          <p style="margin:0 0 24px;font-size:15px;color:#475467;line-height:1.8;">You can now access the PPDC Admin Portal using the credentials below. Please keep them secure.</p>

          <div style="border:1px solid #d0d5dd;border-radius:14px;padding:24px;background:#fcfcfd;">
            <p style="margin:0 0 18px;font-size:13px;font-weight:700;color:#0b4f4a;letter-spacing:0.08em;text-transform:uppercase;">Sign-in Credentials</p>
            <div style="margin-bottom:14px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.08em;">Email</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#101828;">${user.email}</p>
            </div>
            <div>
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.08em;">Temporary Password</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:#0b4f4a;letter-spacing:0.04em;">${password}</p>
            </div>
          </div>

          <div style="margin-top:24px;border:1px solid #eaecf0;border-radius:14px;padding:24px;background:#ffffff;">
            <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#0b4f4a;letter-spacing:0.08em;text-transform:uppercase;">Assigned Access</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
              <span style="display:inline-flex;align-items:center;border-radius:999px;background:#ecfdf3;color:#027a48;padding:8px 14px;font-size:13px;font-weight:700;">Role: ${user.role}</span>
              <span style="display:inline-flex;align-items:center;border-radius:999px;background:#eff8ff;color:#175cd3;padding:8px 14px;font-size:13px;font-weight:700;">${managedRegions.length} assigned scope${managedRegions.length > 1 ? 's' : ''}</span>
            </div>
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#344054;">Platform access</p>
            <ul style="padding-left:18px;margin:0 0 18px;">${scopeListHtml}</ul>
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#344054;">Management access</p>
            ${hasManagementAreas
              ? `<ul style="padding-left:18px;margin:0;">${managementListHtml}</ul>`
              : '<p style="margin:0;color:#667085;font-size:14px;">No management access assigned.</p>'}
          </div>

          <div style="margin-top:28px;text-align:center;">
            <a href="${loginUrl}" style="display:inline-block;background:#0b4f4a;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:14px;font-weight:700;">Sign in to PPDC Admin</a>
            <p style="margin:14px 0 0;font-size:13px;color:#667085;">If the button does not work, copy and paste this link into your browser:<br /><span style="color:#0b4f4a;word-break:break-all;">${loginUrl}</span></p>
          </div>

          <div style="margin-top:28px;padding:16px 18px;border-radius:12px;background:#fffaeb;border:1px solid #fedf89;">
            <p style="margin:0;font-size:13px;line-height:1.7;color:#7a2e0e;">
              For security, ask the user to sign in as soon as possible and keep this temporary password private.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Hello ${user.firstName},`,
    '',
    'Welcome to the PPDC Admin Portal. Your account has been created successfully.',
    '',
    `Email: ${user.email}`,
    `Temporary Password: ${password}`,
    `Role: ${user.role}`,
    `Assigned Access: ${managedRegions.join(', ')}`,
    `Management Access: ${hasManagementAreas ? managementAreas.join(', ') : 'None assigned'}`,
    `Login URL: ${loginUrl}`,
    '',
    'Please keep these credentials secure and sign in as soon as possible.',
    '',
    'PPDC Support Team',
  ].join('\n');

  return {
    subject: 'Welcome to PPDC Admin Portal',
    html,
    text,
  };
}

module.exports = {
  buildWelcomeUserEmail,
};
