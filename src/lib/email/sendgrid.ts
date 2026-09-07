// SendGrid-backed email sending.
//
// Two entry points:
//   sendEmail()     - throws on failure. Use when the caller needs to know
//                      the send actually succeeded (e.g. a manual test route).
//   sendEmailSafe() - never throws. Catches and logs errors so a failed
//                      email never breaks the request/flow it's attached to
//                      (adding a member, a webhook, a background job).
//
// Requires SENDGRID_API_KEY and EMAIL_FROM to be set in the environment.
// EMAIL_FROM must be an address on a domain you've verified (or at least a
// Single Sender you've verified) in SendGrid, or SendGrid will reject the
// send with a 403.

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

interface SendEmailResult {
  ok: boolean;
  status?: number;
  error?: string;
}

const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

function fromAddress(): { email: string; name: string } {
  const raw = process.env.EMAIL_FROM || "";
  // Accept either "email@domain.com" or "Name <email@domain.com>".
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, "") || "Grant Scout Pro", email: match[2].trim() };
  }
  return { name: "Grant Scout Pro", email: raw.trim() };
}

/**
 * Sends an email via the SendGrid v3 API. Throws if SENDGRID_API_KEY or
 * EMAIL_FROM aren't configured, or if SendGrid rejects the send.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const { email: fromEmail, name: fromName } = fromAddress();

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set - cannot send email.");
  }
  if (!fromEmail) {
    throw new Error("EMAIL_FROM is not set - cannot send email (no verified sender address configured).");
  }

  const res = await fetch(SENDGRID_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: input.to }] }],
      from: { email: fromEmail, name: fromName },
      ...(input.replyTo ? { reply_to: { email: input.replyTo } } : {}),
      subject: input.subject,
      content: [
        { type: "text/plain", value: input.text },
        { type: "text/html", value: input.html },
      ],
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`SendGrid rejected the email (HTTP ${res.status}): ${detail}`);
  }

  return { ok: true, status: res.status };
}

/**
 * Best-effort version of sendEmail(): catches and logs any failure instead
 * of throwing, so a broken email send never takes down the request it's
 * attached to (member invites, webhooks, background jobs).
 */
export async function sendEmailSafe(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    return await sendEmail(input);
  } catch (err: any) {
    console.error(`EMAIL SEND FAILED (to: ${input.to}, subject: "${input.subject}"):`, err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}
