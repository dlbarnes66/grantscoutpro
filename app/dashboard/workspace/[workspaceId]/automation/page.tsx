"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceLike } from "../../../../../lib/userLimits";
import { PLAN_CAPABILITIES } from "../../../../../lib/planCapabilities";

export default function AutomationPage({ params }: { params: { workspaceId: string } }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceLike | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      const res = await fetch(`/api/workspace/${params.workspaceId}`);
      if (!res.ok) return;
      const data = await res.json();
      setWorkspace(data.workspace);
    }
    loadWorkspace();
  }, [params.workspaceId]);

  if (!workspace) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Loading workspace…</h1>
      </div>
    );
  }

  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Automation</h1>

      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Plan Capabilities</h2>

        <ul className="space-y-1 text-sm">
          <li>AI Automation: {caps.aiAutomation ? "Enabled" : "Disabled"}</li>
          <li>AI Summary: {caps.aiSummary ? "Enabled" : "Disabled"}</li>
          <li>AI Scores: {caps.aiScores ? "Enabled" : "Disabled"}</li>
          <li>Compare: {caps.compare ? "Enabled" : "Disabled"}</li>
          <li>Export Data: {caps.exportData ? "Enabled" : "Disabled"}</li>
          <li>Workspace Limit: {caps.workspaceLimit}</li>
          <li>AI Writer: {caps.aiWriter ? "Enabled" : "Disabled"}</li>
          <li>Grant Matching: {caps.grantMatching ? "Enabled" : "Disabled"}</li>
          <li>CRM: {caps.crm ? "Enabled" : "Disabled"}</li>
          <li>Scoring Engine: {caps.scoringEngine ? "Enabled" : "Disabled"}</li>
          <li>Advanced Reporting: {caps.advancedReporting ? "Enabled" : "Disabled"}</li>
          <li>Compliance Automation: {caps.complianceAutomation ? "Enabled" : "Disabled"}</li>
          <li>Budget Automation: {caps.budgetAutomation ? "Enabled" : "Disabled"}</li>
          <li>Max Users: {caps.maxUsers}</li>
          <li>Vault Expansion Included: {caps.vaultExpansionIncluded ? "Yes" : "No"}</li>
          <li>Packet Expansion Included: {caps.packetExpansionIncluded ? "Yes" : "No"}</li>
        </ul>
      </div>
    </div>
  );
}
