import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";

// Rolling 30-day window for AI token usage, mirroring the daily
// manualSearchCount/manualSearchResetAt pattern already used for
// manual grant searches (see isManualSearchResetDue in src/lib/plans).
const RESET_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

export interface AiBudgetCheck {
  allowed: boolean;
  limit: number;
  used: number;
  nextResetAt: Date;
}

// Called from callUnifiedModel right before the actual OpenAI request,
// for any call site that knows its workspaceId. Resolves the limit
// from the workspace's EFFECTIVE plan (org tier, or an active pilot -
// see getEffectivePlan in src/lib/plans.ts) rather than trusting
// WorkspaceBilling.aiTokensMonthly, which is hardcoded at workspace
// creation and never updated on a plan change - this keeps the cap
// correct even right after an upgrade or a pilot grant.
export async function checkAiTokenBudget(workspaceId: string): Promise<AiBudgetCheck | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { org: true, billing: true },
  });
  if (!workspace) return null;

  const plan = getEffectivePlan(workspace);
  const limit = plan.aiTokensMonthly;

  let billing = workspace.billing;
  if (!billing) {
    billing = await prisma.workspaceBilling.create({ data: { workspaceId, aiTokensMonthly: limit } });
  }

  const resetDue = Date.now() - billing.aiTokensResetAt.getTime() >= RESET_INTERVAL_MS;

  if (resetDue || billing.aiTokensMonthly !== limit) {
    billing = await prisma.workspaceBilling.update({
      where: { workspaceId },
      data: {
        ...(resetDue ? { aiTokensUsed: 0, aiTokensResetAt: new Date() } : {}),
        aiTokensMonthly: limit,
      },
    });
  }

  return {
    allowed: billing.aiTokensUsed < limit,
    limit,
    used: billing.aiTokensUsed,
    nextResetAt: new Date(billing.aiTokensResetAt.getTime() + RESET_INTERVAL_MS),
  };
}

// Called from callUnifiedModel after a successful OpenAI response,
// with the real token count from response.usage.total_tokens - not a
// flat per-call estimate, so the cap tracks actual spend.
export async function recordAiTokenUsage(workspaceId: string, tokens: number): Promise<void> {
  if (!tokens || tokens <= 0) return;
  await prisma.workspaceBilling
    .upsert({
      where: { workspaceId },
      update: { aiTokensUsed: { increment: tokens } },
      create: { workspaceId, aiTokensUsed: tokens },
    })
    .catch((err) => console.error("Failed to record AI token usage:", err));
}
