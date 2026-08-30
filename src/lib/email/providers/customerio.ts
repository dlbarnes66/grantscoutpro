// src/lib/email/providers/customerio.ts

import axios from "axios";

/**
 * Sends a marketing email using Customer.io.
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
export async function sendMarketingEmail(params: {
  config: Record<string, any>;
  to: string;
  templateId: string;
  payload: Record<string, unknown>;
  category: string;
}) {
  const { config, to, templateId, payload, category } = params;

  if (!config.apiKey) {
    throw new Error("Customer.io API key missing in provider config.");
  }

  try {
    const response = await axios.post(
      "https://api.customer.io/v1/send/email",
      {
        to,
        transactional_message_id: templateId,
        message_data: payload,
        identifiers: {
          email: to,
        },
        metadata: {
          category,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      messageId: response.data?.delivery_id ?? null,
      submittedAt: new Date().toISOString(),
      errorCode: null,
    };
  } catch (error: any) {
    console.error("[Customer.io] Error sending marketing email:", {
      error: error?.response?.data ?? error,
      to,
      templateId,
      category,
    });

    return {
      messageId: null,
      submittedAt: null,
      errorCode: error?.response?.data?.error ?? "unknown_error",
    };
  }
}
