"use client";

import { useEffect, useState } from "react";
import { RiskScore } from "@/components/risk/RiskScore";
import { RiskCategories } from "@/components/risk/RiskCategories";
import { RiskDetails } from "@/components/risk/RiskDetails";
import { RiskFixes } from "@/components/risk/RiskFixes";
import { AIRiskInsights } from "@/components/risk/AIRiskInsights";

export default function RiskDashboardPage() {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real AI integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setRiskData({
        score: 72,
        categories: [
          { id: "eligibility", label: "Eligibility", level: "medium" },
          { id: "compliance", label: "Compliance", level: "low" },
          { id: "budget", label: "Budget", level: "high" },
          { id: "narrative", label: "Narrative", level: "medium" },
          { id: "submission", label: "Submission", level: "low" }
        ],
        details: {
          eligibility: ["Missing geographic eligibility confirmation"],
          compliance: ["All compliance checks passed"],
          budget: ["Budget exceeds allowable personnel costs", "Missing justification for travel"],
          narrative: ["Needs stronger evaluation plan"],
          submission: ["Formatting checks passed"]
        },
        fixes: [
          "Reduce personnel costs by 10%",
          "Add justification for travel expenses",
          "Strengthen evaluation plan section",
          "Confirm geographic eligibility"
        ],
        aiInsights:
          "The primary risks relate to budget alignment and narrative clarity. Addressing these will significantly improve submission readiness."
      });

      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return <div className="text-slate-400">Loading risk dashboard...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Risk Dashboard
      </h1>

      <RiskScore score={riskData.score} />

      <RiskCategories categories={riskData.categories} />

      <RiskDetails details={riskData.details} />

      <RiskFixes fixes={riskData.fixes} />

      <AIRiskInsights insights={riskData.aiInsights} />
    </div>
  );
}
