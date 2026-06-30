"use client";

import { useEffect, useState } from "react";
import { MatchScore } from "@/components/matching/MatchScore";
import { FitAnalysis } from "@/components/matching/FitAnalysis";
import { CategoryAlignment } from "@/components/matching/CategoryAlignment";
import { EligibilityPreview } from "@/components/matching/EligibilityPreview";
import { RecommendedActions } from "@/components/matching/RecommendedActions";

export default function GrantMatchPage({ params }: { params: { id: string } }) {
  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real AI integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setGrant({
        id: params.id,
        title: "Youth Empowerment Grant",
        funder: "Community Impact Foundation",
        matchScore: 87,
        strengths: [
          "Strong alignment with youth programs",
          "Clear community impact",
          "Nonprofit status confirmed"
        ],
        weaknesses: [
          "Limited geographic focus",
          "Budget justification needs refinement"
        ],
        categories: [
          { name: "Youth Development", score: 92 },
          { name: "Community Engagement", score: 88 },
          { name: "Education", score: 74 }
        ],
        eligibility: {
          eligible: true,
          reasons: ["Nonprofit status", "Program alignment"],
          issues: []
        },
        actions: [
          "Generate narrative draft",
          "Optimize budget for alignment",
          "Run compliance pre-check"
        ]
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading match analysis...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Match Analysis: {grant.title}
      </h1>

      <MatchScore score={grant.matchScore} />

      <FitAnalysis strengths={grant.strengths} weaknesses={grant.weaknesses} />

      <CategoryAlignment categories={grant.categories} />

      <EligibilityPreview eligibility={grant.eligibility} />

      <RecommendedActions actions={grant.actions} />
    </div>
  );
}

