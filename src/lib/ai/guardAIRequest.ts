// src/lib/ai/guardAIRequest.ts
//
// Shared guard for the workspace-scoped AI panels (everything under
// src/app/api/workspaces/[id]/documents/[documentId]/ai/*). Before
// this, those routes checked only that *some* user was logged in --
// not that they belonged to the workspace named in the URL -- and had
// no rate limiting or usage tracking at all, despite every call
// hitting OpenAI. This closes both gaps in one place.
//
// Usage (right before the callUnifiedModel(...) call, once `params`
// and `userId` are in scope):
//
//   const guardResponse = await guardAIRequest(params.id, userId);
//   if (guardResponse) return guardResponse;
//
// Returns null when the request may proceed, or a NextResponse to
// return immediately otherwise. (Deliberately not a {ok, response}
// discriminated union: this project builds with strictNullChecks
// off, under which TypeScript does not reliably narrow `!x.ok` on
// object-shaped unions -- every call site would need an `as any`
// escape hatch. A plain nullable return needs no narrowing at all.)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

// Deliberately generous defaults -- this is a safety net against
// runaway loops, scripted abuse, or a compromised account, not a
// day-to-day throttle on normal usage. Tune per plan later if needed.
const AI_CALLS_PER_HOUR = 60;
const AI_WINDOW_SECONDS = 60 * 60;

export async function guardAIRequest(
  workspaceId: string,
  userId: string | null | undefined
): Promise<NextResponse | null> {
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, ownerId: true, members: { select: { userId: true } } },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const isMember = workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = await checkRateLimit(`ai-panel:${workspaceId}`, AI_CALLS_PER_HOUR, AI_WINDOW_SECONDS);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `This workspace has hit its AI usage limit (${AI_CALLS_PER_HOUR} calls/hour). Please try again shortly.`,
      },
      { status: 429 }
    );
  }

  // Best-effort usage counter -- never block the actual request over a
  // logging failure.
  await prisma.workspaceBilling
    .upsert({
      where: { workspaceId },
      update: { usageAI: { increment: 1 } },
      create: { workspaceId, usageAI: 1 },
    })
    .catch((err) => console.error("Failed to increment workspace AI usage:", err));

  return null;
}
