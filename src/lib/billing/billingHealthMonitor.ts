// src/lib/billing/billingHealthMonitor.ts

import { prisma } from "@/lib/db";
import { sendBillingNotification } from "@/lib/billing/sendBillingNotification";

export async function runBillingHealthMonitor(workspaceId: string) {
  try {
    const billing = await prisma.workspaceBilling.findUnique({
      where: { workspaceId },
      select: {
        usageSearches: true,
        usageUploads: true,
        usageMembers: true,
        usageAI: true,
        plan: true,
      },
    });

    if (!billing) {
      await sendBillingNotification(
        workspaceId,
        "billing_missing",
        "Billing record not found for workspace."
      );
      return;
    }

    if (billing.usageAI > 1000) {
      await sendBillingNotification(
        workspaceId,
        "ai_usage_high",
        "AI usage has exceeded recommended limits."
      );
    }

    if (billing.usageMembers > 50) {
      await sendBillingNotification(
        workspaceId,
        "member_usage_high",
        "Member usage has exceeded recommended limits."
      );
    }

    if (billing.usageUploads > 500) {
      await sendBillingNotification(
        workspaceId,
        "upload_usage_high",
        "Upload usage has exceeded recommended limits."
      );
    }

    if (billing.usageSearches > 2000) {
      await sendBillingNotification(
        workspaceId,
        "search_usage_high",
        "Search usage has exceeded recommended limits."
      );
    }
  } catch (err) {
    console.error("BillingHealthMonitor error:", err);
    await sendBillingNotification(
      workspaceId,
      "billing_monitor_error",
      "An error occurred while running the billing health monitor."
    );
  }
}
