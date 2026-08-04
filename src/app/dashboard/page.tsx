import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { TrialBanner } from "./TrialBanner";
import { QuickActions } from "./QuickActions";
import { AIAssistantPanel } from "./AIAssistantPanel";

export default async function DashboardHomePage() {
  // Clerk authentication
  const { userId } = auth();

  if (!userId) {
    return (
      <div className="text-center py-20 text-slate-300">
        <p>You must be logged in to view the dashboard.</p>
      </div>
    );
  }

  // Load workspace
  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
  });

  // Load recent grants
  const grants = workspace
    ? await prisma.grant.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  // Workspace values (fallbacks if null)
  const trialActive = workspace?.trialActive ?? false;
  const trialDaysRemaining = workspace?.trialDaysRemaining ?? 0;
  const trialLocked = workspace?.trialLocked ?? false;
  const subscriptionTier = workspace?.subscriptionTier ?? "free";

  // TEMPORARY DEPLOYMENT SAFE VALUES
  // (Your schema does not have aiTokensUsed or aiCost)
  const aiUsageTokens = 0;
  const aiUsageCost = 0;

  return (
    <div className="space-y-6">
      {/* TRIAL BANNER */}
      <TrialBanner
        trialActive={trialActive}
        trialDaysRemaining={trialDaysRemaining}
        trialLocked={trialLocked}
        subscriptionTier={subscriptionTier}
      />

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* QUICK ACTIONS */}
          <QuickActions />

          {/* WORKSPACE OVERVIEW */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-sm font-semibold text-slate-100 mb-2">
              Workspace Overview
            </div>

            <div className="grid gap-3 text-xs text-slate-300 md:grid-cols-3">
              <div className="rounded-md border border-slate-800/60 bg-slate-900/60 p-3">
                <div className="text-[11px] text-slate-400">Active grants</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">
                  {grants.length}
                </div>
              </div>

              <div className="rounded-md border border-slate-800/60 bg-slate-900/60 p-3">
                <div className="text-[11px] text-slate-400">Saved grants</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">
                  {grants.length}
                </div>
              </div>

              <div className="rounded-md border border-slate-800/60 bg-slate-900/60 p-3">
                <div className="text-[11px] text-slate-400">AI actions today</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">
                  {aiUsageTokens}
                </div>
              </div>
            </div>
          </div>

          {/* RECENT GRANTS */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-sm font-semibold text-slate-100 mb-3">
              Recent Grants
            </div>

            {grants.length === 0 ? (
              <p className="text-slate-400 text-sm">No grants yet.</p>
            ) : (
              <div className="space-y-3">
                {grants.map((grant) => (
                  <a
                    key={grant.id}
                    href={`/dashboard/${params.workspaceId}/grant/${grant.id}`}
                    className="block rounded border border-slate-800 bg-slate-900/40 px-4 py-3 hover:bg-slate-800 transition"
                  >
                    <div className="text-slate-100 font-medium">
                      {grant.title}
                    </div>
                    <div className="text-slate-500 text-xs">
                      Created: {new Date(grant.createdAt).toLocaleDateString()}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — AI PANEL */}
        <AIAssistantPanel
          workspaceName={workspace?.name ?? "Workspace"}
          aiUsageTokens={aiUsageTokens}
          aiUsageCost={aiUsageCost}
        />
      </div>
    </div>
  );
}
