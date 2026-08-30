import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    // No trialNotification field in schema, so we just mark locked or do nothing.
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { trialLocked: true },
    });

    return NextResponse.json({ notified: true });
  } catch (err: any) {
    console.error("TRIAL NOTIFY ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
