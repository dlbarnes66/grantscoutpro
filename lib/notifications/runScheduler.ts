import { prisma } from "@/lib/prisma";
import { checkDeadlines } from "./checkDeadlines";
import { checkNewGrants } from "./checkNewGrants";
import { checkAIScoreChanges } from "./checkAIScoreChanges";
import { dailyDigest } from "./dailyDigest";

export async function runNotificationScheduler() {
  await checkDeadlines();
  await checkNewGrants();
  await checkAIScoreChanges();

  const workspaces = await prisma.workspace.findMany({
    include: { owner: true },
  });

  for (const ws of workspaces) {
    if (ws.ownerId) {
      await dailyDigest(ws.ownerId, ws.id);
    }
  }

  return { success: true };
}
