import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GrantTierAccess } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { grantId, tier, workspaceId } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    // ⭐ Fetch full grant with related data
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      include: {
        documents: true,
        GrantDraft: true,
        GrantSection: true,
        applicationHistories: true,
        applications: true,
        narratives: true,
      },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // ⭐ Workspace scoping (if grant belongs to a workspace)
    if (workspaceId && grant.workspaceId && grant.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Grant not accessible in this workspace" },
        { status: 403 }
      );
    }

    // ⭐ Tier enforcement
    const allowed = isGrantAllowedForTier(grant, tier);

    if (!allowed) {
      // ⭐ Return limited fields for restricted tiers
      return NextResponse.json({
        id: grant.id,
        title: grant.title,
        summary: grant.summary,
        description: grant.description,
        deadline: grant.deadline,
        url: grant.url,
        source: grant.source,
        tierAccess: grant.tierAccess,
      });
    }

    // ⭐ Inject AI fields into response
    const enrichedGrant = injectAiFields(grant);

    return NextResponse.json({ grant: enrichedGrant });
  } catch (err: any) {
    console.error("Grant details error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* -------------------------------------------------------
   ⭐ Tier Enforcement Logic
-------------------------------------------------------- */
function isGrantAllowedForTier(grant: any, tier: string) {
  switch (tier) {
    case "ENTERPRISE":
      return true;

    case "PRO":
      return (
        grant.tierAccess === GrantTierAccess.FEDERAL_ONLY ||
        grant.tierAccess === GrantTierAccess.FEDERAL_STATE ||
        grant.tierAccess === GrantTierAccess.PRO
      );

    case "FEDERAL_STATE":
      return (
        grant.tierAccess === GrantTierAccess.FEDERAL_ONLY ||
        grant.tierAccess === GrantTierAccess.FEDERAL_STATE
      );

    case "FEDERAL_ONLY":
    default:
      return grant.tierAccess === GrantTierAccess.FEDERAL_ONLY;
  }
}

/* -------------------------------------------------------
   ⭐ AI Field Injection
-------------------------------------------------------- */
function injectAiFields(grant: any) {
  return {
    ...grant,
    ai: {
      eligibilityScore: grant.aiEligibilityScore || null,
      alignmentScore: grant.aiAlignmentScore || null,
      competitivenessScore: grant.aiCompetitivenessScore || null,
      riskScore: grant.aiRiskScore || null,
      readinessScore: grant.aiReadinessScore || null,
      summary: grant.aiSummary || null,
      recommendations: grant.aiRecommendations || null,
    },
  };
}
