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
      status: `/api/workspaces/${params.id}/trial/status`,
      lock: `/api/workspaces/${params.id}/trial/lock`,
      unlock: `/api/workspaces/${params.id}/trial/unlock`,
      override: `/api/workspaces/${params.id}/trial/override`,
    },
  });
}
