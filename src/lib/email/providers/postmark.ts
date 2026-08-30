// src/lib/email/providers/postmark.ts

import axios from "axios";

/**
 * Sends a transactional email using Postmark.
 *
 * Expected config shape (from getConfig.ts):
 * {
 *   apiKey: string;
 *   sendingDomain?: string;
 * }
 *
 * Expected params:
 * {
 *   config: Record<string, any>;
 *   to: string;
 *   templateId: string;
 *   payload: Record<string, unknown>;
 *   category: string;
 * }
 */
export async function sendTransactionalEmail(params: {
  config: Record<string, any>;
  to: string;
  templateId: string;
  payload: Record<string, unknown>;
  category: string;
}) {
  const { config, to, templateId, payload, category } = params;

  if (!config.apiKey) {
    throw new Error("Postmark API key missing in provider config.");
  }

  try {
    const response = await axios.post(
      "https://api.postmarkapp.com/email/withTemplate",
      {
        From: `no-reply@${config.sendingDomain ?? "grantscoutpro.com"}`,
        To: to,
        TemplateId: templateId,
        TemplateModel: payload,
        Tag: category,
      },
      {
        headers: {
          "X-Postmark-Server-Token": config.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      messageId: response.data?.MessageID ?? null,
      submittedAt: response.data?.SubmittedAt ?? null,
      errorCode: response.data?.ErrorCode ?? null,
    };
  } catch (error: any) {
    console.error("[Postmark] Error sending transactional email:", {
      error: error?.response?.data ?? error,
      to,
      templateId,
      category,
    });

    return {
      messageId: null,
      submittedAt: null,
      errorCode: error?.response?.data?.ErrorCode ?? "unknown_error",
    };
  }
}
