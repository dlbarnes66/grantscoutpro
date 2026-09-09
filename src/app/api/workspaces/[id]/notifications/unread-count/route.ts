import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const count = await prisma.workspaceNotification.count({
      where: {
        workspaceId: params.id,
        userId,
        read: false,
      },
    });

    return NextResponse.json({ success: true, unread: count });
  } catch (err: any) {
    console.error("WORKSPACE NOTIFICATIONS UNREAD COUNT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
