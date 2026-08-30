import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type NarrativeInput = {
  summary?: string;
  outcomes?: string;
  needStatement?: string;
};

export async function POST(req: NextRequest) {
  const body: NarrativeInput = await req.json().catch(() => ({}));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if ((body.summary ?? "").length > 300)
    strengths.push("Strong, detailed project summary.");
  else
    improvements.push("Expand the project summary with more specifics.");

  if ((body.outcomes ?? "").includes("measurable"))
    strengths.push("Outcomes reference measurability.");
  else
    improvements.push("Clarify measurable outcomes and indicators.");

  if ((body.needStatement ?? "").includes("data"))
    strengths.push("Need statement references data or evidence.");
  else
    improvements.push("Support the need statement with data or citations.");

  return NextResponse.json({
    strengths,
    improvements
  });
}
