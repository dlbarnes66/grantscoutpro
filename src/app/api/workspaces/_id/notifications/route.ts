import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    success: true,
    routes: {
      list: `/api/workspaces/${params.id}/notifications/list`,
      create: `/api/workspaces/${params.id}/notifications/create`,
      delete: `/api/workspaces/${params.id}/notifications/delete`,
      read: `/api/workspaces/${params.id}/notifications/read`,
      markRead: `/api/workspaces/${params.id}/notifications/mark-read`,
      unreadCount: `/api/workspaces/${params.id}/notifications/unread-count`,
    },
  });
}
