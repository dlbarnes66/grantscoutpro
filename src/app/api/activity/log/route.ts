import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, action, metadata } = await req.json();

  if (!workspaceId || !action) {
    return NextResponse.json(
      { error: "workspaceId and action are required" },
      { status: 400 }
    );
  }

  try {
    const entry = await prisma.workspaceActivity.create({
      data: {
        workspaceId,
        userId,
        action,
        metadata,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("ACTIVITY LOG ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
