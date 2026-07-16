import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const saved = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        query: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, saved });
  } catch (err) {
    console.error("Saved searches error:", err);
    return NextResponse.json(
      { error: "Failed to load saved searches" },
      { status: 500 }
    );
  }
}
