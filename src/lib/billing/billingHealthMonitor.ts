import { prisma } from "@/lib/prisma";
import { sendBillingNotification } from "./sendBillingNotification";

/**
 * Nightly billing health monitor.
 * - Locks past_due workspaces
 * - Unlocks workspaces when paid
 * - Sends renewal reminders
 * - Sends seat warnings
 */
export async function billingHealthMonitor() {
  const workspaces = await prisma.workspace.findMany({
    include: {
      billing: true,
      addons: true,
    },
  });

  const now = new Date();

  for (const ws of workspaces) {
    const billing = ws.billing;
    if (!billing) continue;

    const status = ws.billingStatus;

    // ---------------------------------------------------------
    // 1. Auto-lock past_due workspaces
    // ---------------------------------------------------------
    if (status === "past_due" && !ws.trialLocked && !ws.pilotLocked) {
      await prisma.workspace.update({
        where: { id: ws.id },
        data: { trialLocked: true },
      });

      await sendBillingNotification(
        ws.id,
        "Your workspace is past due and has been locked."
      );
    }

    // ---------------------------------------------------------
    // 2. Auto-unlock when paid
    // ---------------------------------------------------------
    if (status === "active" && ws.trialLocked) {
      await prisma.workspace.update({
        where: { id: ws.id },
        data: { trialLocked: false },
      });

      await sendBillingNotification(
        ws.id,
        "Your workspace has been unlocked."
      );
    }

    // ---------------------------------------------------------
    // 3. Renewal reminders (1 day before)
    // ---------------------------------------------------------
    if (ws.billingRenewalDate) {
      const diff = ws.billingRenewalDate.getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      if (days <= 1 && days > 0) {
        await sendBillingNotification(
          ws.id,
          "Your subscription renews tomorrow."
        );
      }
    }

    // ---------------------------------------------------------
    // 4. Seat warnings (90% usage)
    // ---------------------------------------------------------
    if (ws.currentSeats >= ws.maxSeats * 0.9) {
      await sendBillingNotification(
        ws.id,
        "Your workspace is nearing its seat limit."
      );
    }
  }
}
