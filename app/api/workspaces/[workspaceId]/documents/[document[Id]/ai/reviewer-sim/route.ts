import { NextResponse } from "next/server";

export async function POST(req: Request, { params }) {
  const { workspaceId, documentId } = params;
  const { userId, content } = await req.json();

  // Placeholder simulation until AI is wired in
  const simulation = {
    overallLikelihood: 72,
    reviewers: [
      {
        type: "Strict Federal",
        score: 68,
        summary: "Strong alignment but missing evidence in key sections.",
        concerns: ["Budget justification unclear", "Impact metrics vague"],
        praise: ["Clear mission alignment", "Strong community partnerships"],
        recommendations: ["Add measurable KPIs", "Clarify budget narrative"]
      }
    ],
    globalRecommendations: [
      "Strengthen evidence-based claims",
      "Improve clarity in methodology section"
    ]
  };

  return NextResponse.json({ simulation });
}
