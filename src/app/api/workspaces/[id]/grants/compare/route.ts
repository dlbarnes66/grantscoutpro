import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();

  const guardResponse = await guardAIRequest(params.id, userId);
  if (guardResponse) return guardResponse;

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.grantIds) || body.grantIds.length < 2) {
    return NextResponse.json(
      { error: "Provide at least 2 grantIds to compare" },
      { status: 400 }
    );
  }

  const requestedIds: string[] = Array.from(
    new Set<string>(body.grantIds as string[])
  ).slice(0, 4);

  try {
    const grants = await prisma.grant.findMany({
      where: {
        id: { in: requestedIds },
        workspaceId: params.id,
      },
    });

    const foundIds = new Set(grants.map((g) => g.id));
    const ignored = requestedIds.filter((id) => !foundIds.has(id));

    const compared = grants.map((g) => ({
      id: g.id,
      title: g.title,
      agency: g.agency,
      category: g.category,
      status: g.status,
      deadline: g.deadline,
      awardFloor: g.awardFloor,
      awardCeiling: g.awardCeiling,
      totalFunding: g.totalFunding,
      aiEligibilityScore: g.aiEligibilityScore,
      aiAlignmentScore: g.aiAlignmentScore,
      aiCompetitivenessScore: g.aiCompetitivenessScore,
      aiRiskScore: g.aiRiskScore,
      aiReadinessScore: g.aiReadinessScore,
      url: g.url,
    }));

    let aiSummary: string | null = null;

    if (compared.length >= 2) {
      const prompt = `You are helping a nonprofit grant strategist decide which of these ${compared.length} grant opportunities to prioritize. For each grant, weigh the deadline urgency, award size, and any AI-generated eligibility/alignment/competitiveness/risk scores provided (scores are 0-100; higher eligibility/alignment/readiness is better, higher risk is worse, missing scores mean not yet assessed). Give a short recommendation (3-5 sentences) on which grant(s) to prioritize and why, and flag any grant that looks like a poor fit or long shot.

Grants:
${compared
  .map(
    (g, i) => `${i + 1}. "${g.title}" - ${g.agency || "Unknown agency"}
   Category: ${g.category || "n/a"} | Status: ${g.status}
   Award range: ${money(g.awardFloor)} - ${money(g.awardCeiling)}${g.totalFunding ? ` | Total funding: ${money(g.totalFunding)}` : ""}
   Deadline: ${g.deadline ? new Date(g.deadline).toLocaleDateString() : "n/a"}
   AI scores - Eligibility: ${g.aiEligibilityScore ?? "n/a"}, Alignment: ${g.aiAlignmentScore ?? "n/a"}, Competitiveness: ${g.aiCompetitivenessScore ?? "n/a"}, Risk: ${g.aiRiskScore ?? "n/a"}, Readiness: ${g.aiReadinessScore ?? "n/a"}`
  )
  .join("\n")}`;

      aiSummary = await callUnifiedModel(prompt);
    }

    return NextResponse.json({ success: true, compared, ignored, aiSummary });
  } catch (err: any) {
    console.error("WORKSPACE GRANTS COMPARE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
