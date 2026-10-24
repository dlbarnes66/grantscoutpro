// src/lib/ai/packageAiGuard.ts
//
// Plan check, monthly AI-token cap, and usage counting for the grant
// package routes (generate / section / review / application-assistant).
//
// Why this exists: those routes call OpenAI directly (proposalPackage.ts,
// budgetBuilder.ts, grantMatch.ts, packageSections.ts, packageReview.ts,
// applicationAssistant.ts) instead of going through callUnifiedModel, so
// they skipped the per-plan aiTokensMonthly cap and were never counted
// against it. This module closes that gap without changing those
// libraries' signatures:
//
//   1. A route calls guardPackageAI(workspaceId) before doing AI work and
//      returns the response if one comes back.
//   2. The route body runs inside runWithAiWorkspace(workspaceId, ...).
//   3. Each OpenAI call site calls trackPackageAiUsage(response) right
//      after it returns; that records the real token count for the
//      workspace if (and only if) a workspace is in scope. Callers with
//      no workspace in scope (for example the grant scan cron) are not
//      affected.

import { AsyncLocalStorage } from "node:async_hooks";
import { NextResponse } from "next/server";
import { getPlan } from "@/lib/plans";
import { checkAiTokenBudget, recordAiTokenUsage } from "@/lib/ai/aiUsage";

const store = new AsyncLocalStorage<{ workspaceId: string }>();

export function runWithAiWorkspace<T>(workspaceId: string, fn: () => Promise<T>): Promise<T> {
  return store.run({ workspaceId }, fn);
}

type UsageResponse = { usage?: { total_tokens?: number | null } | null };

export function trackPackageAiUsage(response: UsageResponse): void {
  const ctx = store.getStore();
  if (!ctx) return;
  void recordAiTokenUsage(ctx.workspaceId, response?.usage?.total_tokens ?? 0);
}

// The AI Proposal Writer is listed from the Team plan up on the pricing
// page (see PricingSection.tsx). Enforcement is behind an environment
// switch, off by default, so turning it on is a deliberate decision about
// existing Basic customers rather than a surprise in a code deploy. Set
// ENFORCE_AI_PROPOSAL_PLAN_GATE=true to enforce.
function planGateEnforced(): boolean {
  return process.env.ENFORCE_AI_PROPOSAL_PLAN_GATE === "true";
}

/**
 * Returns null when the workspace may run package AI, or a ready-to-return
 * response when it may not (plan does not include it, or the monthly AI
 * allowance is used up). Fails open if the budget lookup itself errors, so
 * a billing-table problem never blocks a customer's work.
 */
export async function guardPackageAI(workspaceId: string): Promise<NextResponse | null> {
  let budget;
  try {
    budget = await checkAiTokenBudget(workspaceId);
  } catch (err) {
    console.error("guardPackageAI: budget lookup failed, allowing request:", err);
    return null;
  }
  if (!budget) return null;

  if (planGateEnforced() && !getPlan(budget.planId).aiProposalWriter) {
    return NextResponse.json(
      {
        error: "The AI Proposal Writer is included with the Team plan and above. Upgrade to generate AI drafts.",
        code: "PLAN_UPGRADE_REQUIRED",
      },
      { status: 403 }
    );
  }

  if (!budget.allowed) {
    return NextResponse.json(
      {
        error: `This workspace has used its monthly AI allowance (${budget.used.toLocaleString()} of ${budget.limit.toLocaleString()} tokens). It resets on ${budget.nextResetAt.toLocaleDateString("en-US")}, or you can upgrade your plan for more.`,
        code: "AI_ALLOWANCE_EXHAUSTED",
      },
      { status: 429 }
    );
  }

  return null;
}
