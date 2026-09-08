// Plain HTML + text templates for transactional emails.
//
// Kept intentionally simple (inline styles, no external assets) so they
// render consistently across email clients without a build step.

const BRAND_COLOR = "#00E5FF";
const APP_NAME = "Grant Scout Pro";

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://app.grantscoutpro.com";
  return `${base.replace(/\/$/, "")}${path}`;
}

function wrap(bodyHtml: string, preheader: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${APP_NAME}</title>
  </head>
  <body style="margin:0;padding:0;background:#0A1A2F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:#0A1A2F;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A1A2F;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#0B1B33;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:6px;background:linear-gradient(135deg,#00E5FF,#0090B0);color:#06131F;font-weight:700;font-size:13px;vertical-align:middle;">G</span>
                <span style="margin-left:8px;color:#ffffff;font-size:15px;font-weight:600;vertical-align:middle;">${APP_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#cbd5e1;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid rgba(255,255,255,0.06);color:#64748b;font-size:12px;">
                You're receiving this because of activity on your ${APP_NAME} account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:8px;padding:10px 18px;background:${BRAND_COLOR};color:#06131F;font-weight:600;font-size:13px;text-decoration:none;border-radius:8px;">${label}</a>`;
}

export function workspaceInviteEmail(input: {
  workspaceName: string;
  inviterName: string | null;
  role: string;
  workspaceId: string;
}) {
  const { workspaceName, inviterName, role, workspaceId } = input;
  const inviter = inviterName || "A teammate";
  const link = appUrl(`/workspace/${workspaceId}`);

  const subject = `You've been added to ${workspaceName} on ${APP_NAME}`;

  const html = wrap(
    `<p style="margin:0 0 12px;color:#fff;font-size:16px;font-weight:600;">You're in!</p>
     <p style="margin:0 0 12px;">${inviter} added you to <strong style="color:#fff;">${workspaceName}</strong> as a <strong style="color:#fff;">${role}</strong> on ${APP_NAME}.</p>
     <p style="margin:0 0 4px;">Sign in with this email address to get started.</p>
     ${button("Open workspace", link)}`,
    `${inviter} added you to ${workspaceName} on ${APP_NAME}`
  );

  const text = `You're in!\n\n${inviter} added you to "${workspaceName}" as a ${role} on ${APP_NAME}.\n\nSign in with this email address to get started: ${link}`;

  return { subject, html, text };
}

export function deadlineReminderEmail(input: {
  grantTitle: string;
  daysLeft: number;
  workspaceName: string;
  workspaceId: string;
  grantId: string;
}) {
  const { grantTitle, daysLeft, workspaceName, workspaceId, grantId } = input;
  const dayWord = daysLeft === 1 ? "day" : "days";
  const link = appUrl(`/workspace/${workspaceId}/grants/${grantId}`);

  const subject = `Deadline in ${daysLeft} ${dayWord}: ${grantTitle}`;

  const html = wrap(
    `<p style="margin:0 0 12px;color:#fff;font-size:16px;font-weight:600;">Grant deadline approaching</p>
     <p style="margin:0 0 12px;"><strong style="color:#fff;">${grantTitle}</strong> is due in <strong style="color:${BRAND_COLOR};">${daysLeft} ${dayWord}</strong> in your <strong style="color:#fff;">${workspaceName}</strong> workspace.</p>
     ${button("View grant", link)}`,
    `${grantTitle} is due in ${daysLeft} ${dayWord}`
  );

  const text = `Grant deadline approaching\n\n"${grantTitle}" is due in ${daysLeft} ${dayWord} in your "${workspaceName}" workspace.\n\nView it here: ${link}`;

  return { subject, html, text };
}

export function grantMatchEmail(input: {
  grantTitle: string;
  score: number;
  workspaceName: string;
  workspaceId: string;
  grantId: string;
  deadline: string | null;
}) {
  const { grantTitle, score, workspaceName, workspaceId, grantId, deadline } = input;
  const link = appUrl(`/workspace/${workspaceId}/grants/${grantId}`);
  const deadlineLine = deadline ? ` Deadline: <strong style="color:#fff;">${deadline}</strong>.` : "";

  const subject = `New grant match (${score}/100): ${grantTitle}`;

  const html = wrap(
    `<p style="margin:0 0 12px;color:#fff;font-size:16px;font-weight:600;">We found a match for your projects</p>
     <p style="margin:0 0 12px;"><strong style="color:#fff;">${grantTitle}</strong> scored <strong style="color:${BRAND_COLOR};">${score}/100</strong> against your ${workspaceName} profile.${deadlineLine}</p>
     ${button("View grant", link)}`,
    `${grantTitle} scored ${score}/100 against your profile`
  );

  const text = `We found a match for your projects

"${grantTitle}" scored ${score}/100 against your "${workspaceName}" profile.${deadline ? ` Deadline: ${deadline}.` : ""}

View it here: ${link}`;

  return { subject, html, text };
}

export function welcomeEmail(input: { name: string | null }) {
  const name = input.name?.split(" ")[0] || "there";
  const link = appUrl("/dashboard");

  const subject = `Welcome to ${APP_NAME}`;

  const html = wrap(
    `<p style="margin:0 0 12px;color:#fff;font-size:16px;font-weight:600;">Welcome, ${name}!</p>
     <p style="margin:0 0 12px;">Your ${APP_NAME} account is ready. Search grants, get AI-powered fit scoring, and draft proposals faster with your team.</p>
     ${button("Go to dashboard", link)}`,
    `Your ${APP_NAME} account is ready`
  );

  const text = `Welcome, ${name}!\n\nYour ${APP_NAME} account is ready. Search grants, get AI-powered fit scoring, and draft proposals faster with your team.\n\nGo to your dashboard: ${link}`;

  return { subject, html, text };
}
