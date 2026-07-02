"use client";

import { useEffect, useState } from "react";
import { RenewalEligibility } from "@/components/renewal/RenewalEligibility";
import { RenewalProbability } from "@/components/renewal/RenewalProbability";
import { RenewalNarrative } from "@/components/renewal/RenewalNarrative";
import { RenewalBudgetUpdate } from "@/components/renewal/RenewalBudgetUpdate";
import { AIRenewalRecommendations } from "@/components/renewal/AIRenewalRecommendations";

export default function RenewalWorkspacePage({ params }: { params: { id: string } }) {
  const [renewalData, setRenewalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real AI integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setRenewalData({
        eligibility: {
          eligible: true,
          reasons: [
            "All reporting requirements met",
            "Strong KPI performance",
            "Positive funder feedback"
          ],
          issues: []
        },
        probability: 82,
        narrative: "",
        budget: [
          { id: "1", category: "Personnel", previous: 60000, updated: 65000 },
          { id: "2", category: "Supplies", previous: 8000, updated: 9000 },
          { id: "3", category: "Travel", previous: 5000, updated: 4500 }
        ],
        aiRecommendations:
          "Strengthen the renewal narrative by emphasizing long-term community impact and improved KPI performance."
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading renewal workspace...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Renewal Workspace
      </h1>

      <RenewalEligibility eligibility={renewalData.eligibility} />

      <RenewalProbability score={renewalData.probability} />

      <RenewalNarrative />

      <RenewalBudgetUpdate budget={renewalData.budget} />

      <AIRenewalRecommendations insights={renewalData.aiRecommendations} />
    </div>
  );
}
