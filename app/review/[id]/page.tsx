"use client";

import { useState, useEffect } from "react";
import { ReviewerCards } from "@/components/review/ReviewerCards";
import { ScoreMatrix } from "@/components/review/ScoreMatrix";
import { CommentThreads } from "@/components/review/CommentThreads";
import { ConsensusSummary } from "@/components/review/ConsensusSummary";
import { FundingLikelihood } from "@/components/review/FundingLikelihood";

export default function ReviewerPanelPage({ params }: { params: { id: string } }) {
  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real API integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setReviewData({
        reviewers: [
          { id: "1", name: "Alex Johnson", role: "Program Officer", score: 82 },
          { id: "2", name: "Maria Lopez", role: "Grant Analyst", score: 88 },
          { id: "3", name: "AI Reviewer", role: "AI Agent", score: 91 }
        ],
        criteria: [
          { id: "impact", label: "Impact", scores: [4, 5, 5] },
          { id: "feasibility", label: "Feasibility", scores: [3, 4, 5] },
          { id: "budget", label: "Budget Alignment", scores: [4, 4, 5] },
          { id: "compliance", label: "Compliance", scores: [5, 5, 5] }
        ],
        comments: [
          {
            reviewer: "Alex Johnson",
            text: "Strong impact but needs clearer evaluation metrics.",
            timestamp: "2026-06-30 09:12"
          },
          {
            reviewer: "Maria Lopez",
            text: "Budget is well aligned with program goals.",
            timestamp: "2026-06-30 09:20"
          }
        ],
        consensus: {
          averageScore: 87,
          strengths: ["Strong impact", "Excellent compliance", "Solid budget alignment"],
          weaknesses: ["Evaluation plan needs refinement"]
        },
        likelihood: 78
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading reviewer panel...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Reviewer Panel
      </h1>

      <ReviewerCards reviewers={reviewData.reviewers} />

      <ScoreMatrix criteria={reviewData.criteria} />

      <CommentThreads comments={reviewData.comments} />

      <ConsensusSummary consensus={reviewData.consensus} />

      <FundingLikelihood likelihood={reviewData.likelihood} />
    </div>
  );
}
