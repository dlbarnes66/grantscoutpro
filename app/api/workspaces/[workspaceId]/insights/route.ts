import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { generateInsights } from "@/lib/ai/generateInsights";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["member", "admin"]);

    const insights = await prisma.workspaceInsight.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error("Insights fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["member", "admin"]);

    const ai = await generateInsights(params.workspaceId);

    const saved = await prisma.workspaceInsight.create({
      data: {
        workspaceId: params.workspaceId,
        type: "ai_insight",
        summary: ai.summary,
        metadata: ai,
      },
    });

    return NextResponse.json({ insight: saved });
  } catch (error: any) {
    console.error("Insights generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
