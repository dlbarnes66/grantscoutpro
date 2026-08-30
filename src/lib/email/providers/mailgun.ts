// src/lib/email/providers/mailgun.ts

import axios from "axios";

/**
 * Sends an enterprise-grade email using Mailgun.
 *
 * Expected config shape (from getConfig.ts):
 * {
 *   apiKey: string;
 *   sendingDomain: string;
 *   dedicatedIp?: string;
 * }
 *
 * Expected params:
 * {
 *   config: Record<string, any>;
 *   to: string;
 *   subject: string;
 *   html: string;
 *   text?: string;
 *   category: string;
 * }
 */
export async function sendEnterpriseEmail(params: {
  config: Record<string, any>;
  to: string;
  subject: string;
  html: string;
  text?: string;
  category: string;
}) {
  const { config, to, subject, html, text, category } = params;

  if (!config.apiKey) {
    throw new Error("Mailgun API key missing in provider config.");
  }

  if (!config.sendingDomain) {
    throw new Error("Mailgun sending domain missing in provider config.");
  }

  const domain = config.sendingDomain;
  const endpoint = `https://api.mailgun.net/v3/${domain}/messages`;

  const formData = new URLSearchParams();
  formData.append("from", `no-reply@${domain}`);
  formData.append("to", to);
  formData.append("subject", subject);
  formData.append("html", html);
  if (text) formData.append("text", text);
  formData.append("o:tag", category);

  // Dedicated IP support (Enterprise)
  if (config.dedicatedIp) {
    formData.append("o:delivery-ip", config.dedicatedIp);
  }

  try {
    const response = await axios.post(endpoint, formData, {
      auth: {
        username: "api",
        password: config.apiKey,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return {
      messageId: response.data?.id ?? null,
      submittedAt: new Date().toISOString(),
      errorCode: null,
    };
  } catch (error: any) {
    console.error("[Mailgun] Error sending enterprise email:", {
      error: error?.response?.data ?? error,
      to,
      subject,
      category,
    });

    return {
      messageId: null,
      submittedAt: null,
      errorCode: error?.response?.data?.message ?? "unknown_error",
    };
  }
}
