import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/embeddings";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    const documents = await prisma.workspaceDocument.count({
      where: { workspaceId },
    });

    const grants = await prisma.grant.count({
      where: { workspaceId },
    });

    const matches = await prisma.grantMatch.count({
      where: { workspaceId },
    });

    // AI insights (simple starter version)
    const insights = [
      "Your workspace is trending toward education and community grants.",
      "You uploaded 3 documents this week — consider running grant matching.",
      "Top recommended grant: Community Development Block Grant (CDBG).",
    ];

    return NextResponse.json({
      ok: true,
      metrics: {
        documents,
        grants,
        matches,
      },
      insights,
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
