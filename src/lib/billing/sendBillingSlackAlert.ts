// src/lib/billing/sendBillingSlackAlert.ts

export async function sendBillingSlackAlert(
  workspaceId: string,
  message: string
) {
  try {
    const webhook = process.env.SLACK_BILLING_WEBHOOK;

    if (!webhook) {
      console.warn("Slack billing webhook not configured");
      return;
    }

    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Billing Alert for Workspace ${workspaceId}: ${message}`,
      }),
    });
  } catch (err) {
    console.error("Failed to send Slack billing alert:", err);
  }
}
