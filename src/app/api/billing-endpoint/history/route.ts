import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }
    const history = await prisma.billingLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ workspaceId, history });
  } catch (err) {
    console.error("billing history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
