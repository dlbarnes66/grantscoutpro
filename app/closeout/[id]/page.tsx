"use client";

import { useEffect, useState } from "react";
import { CloseoutChecklist } from "@/components/closeout/CloseoutChecklist";
import { FinalReportPanel } from "@/components/closeout/FinalReportPanel";
import { FinancialReconciliation } from "@/components/closeout/FinancialReconciliation";
import { AssetReporting } from "@/components/closeout/AssetReporting";
import { AICloseoutSummary } from "@/components/closeout/AICloseoutSummary";

export default function CloseoutWorkspacePage({ params }: { params: { id: string } }) {
  const [closeoutData, setCloseoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real AI integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setCloseoutData({
        checklist: [
          { id: "final-report", label: "Final Report Completed", done: false },
          { id: "financials", label: "Financial Reconciliation Completed", done: false },
          { id: "assets", label: "Asset Reporting Completed", done: true },
          { id: "compliance", label: "Compliance Checks Passed", done: true }
        ],
        finalReport: "",
        financials: [
          { id: "1", category: "Personnel", allocated: 60000, spent: 58000 },
          { id: "2", category: "Supplies", allocated: 8000, spent: 7500 },
          { id: "3", category: "Travel", allocated: 5000, spent: 5200 }
        ],
        assets: [
          { id: "1", name: "Laptop", value: 1200, status: "Returned" },
          { id: "2", name: "Camera", value: 900, status: "In Use" }
        ],
        aiSummary:
          "The project achieved strong outcomes and maintained financial compliance. Minor overspending in travel should be explained in the final report."
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading closeout workspace...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Closeout Workspace
      </h1>

      <CloseoutChecklist checklist={closeoutData.checklist} />

      <FinalReportPanel />

      <FinancialReconciliation financials={closeoutData.financials} />

      <AssetReporting assets={closeoutData.assets} />

      <AICloseoutSummary insights={closeoutData.aiSummary} />
    </div>
  );
}
