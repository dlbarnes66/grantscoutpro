import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { notificationId } = await req.json().catch(() => ({}));

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    const notification = await prisma.workspaceNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    await prisma.workspaceNotification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE NOTIFICATIONS DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
