export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ActivityLogBody {
  userId: string;
  action: string;
  metadata?: Record<string, any> | null;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, action, metadata }: ActivityLogBody = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action" },
        { status: 400 }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: metadata ?? null,
      },
    });

    return NextResponse.json({ logged: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown server error";

    console.error("Activity log error:", err);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
