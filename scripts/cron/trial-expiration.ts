// scripts/cron/trial-expiration.ts

import { prisma } from "@/lib/prisma";
import { sendTrialEmail } from "@/lib/notifications/trial-email";

export async function runTrialExpirationCron() {
  const now = new Date();

  // Find all expired trials that are still active
  const expiredWorkspaces = await prisma.workspace.findMany({
    where: {
      trialActive: true,
      trialEnd: { lte: now },
    },
    include: { owner: true },
  });

  for (const ws of expiredWorkspaces) {
    await prisma.workspace.update({
      where: { id: ws.id },
      data: {
        trialActive: false,
        trialLocked: true,
      },
    });

    // ⭐ Send trial expired email
    await sendTrialEmail(
      ws.owner.email,
      "Your trial has expired",
      "Your workspace is now locked. Upgrade to continue."
    );

    console.log(`Workspace ${ws.id} trial expired → locked`);
  }
}
