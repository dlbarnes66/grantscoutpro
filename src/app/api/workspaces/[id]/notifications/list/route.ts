import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await prisma.workspaceNotification.findMany({
      where: {
        workspaceId: params.id,
        userId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    console.error("WORKSPACE NOTIFICATIONS LIST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
