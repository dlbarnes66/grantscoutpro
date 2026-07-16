import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    const history = await prisma.searchAnalytics.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        query: true,
        resultCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, history });
  } catch (err) {
    console.error("Search history error:", err);
    return NextResponse.json(
      { error: "Failed to load search history" },
      { status: 500 }
    );
  }
}
