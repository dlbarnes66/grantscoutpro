import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-to-server only: the Nonprofit Management app asks whether a
// workspace has paid for the "nonprofit" addon. No user session here; it's
// protected by a shared secret (NONPROFIT_OS_SHARED_SECRET, the same value
// set as GSP_SHARED_SECRET in the Nonprofit Management app). Read-only.
//
//   GET ?userId=<Clerk user id>        -> the workspaces that user owns, each with `entitled`
//                                         (used when an owner links their organization)
//   GET ?workspaceId=<workspace id>    -> { entitled } for one workspace (the periodic check)
//
// Without the secret configured, the route answers 503 and does nothing.

function authorized(req: NextRequest): boolean | null {
  const secret = process.env.NONPROFIT_OS_SHARED_SECRET;
  if (!secret || secret.length < 32) return null;
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

const ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function GET(req: NextRequest) {
  const ok = authorized(req);
  if (ok === null) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = req.nextUrl.searchParams.get("userId");
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  try {
    if (workspaceId) {
      if (!ID.test(workspaceId)) return NextResponse.json({ error: "Bad workspaceId" }, { status: 400 });
      const ws = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          id: true,
          name: true,
          addons: { where: { addonType: "nonprofit", active: true }, select: { id: true } },
        },
      });
      if (!ws) return NextResponse.json({ workspaceId, exists: false, entitled: false });
      return NextResponse.json({ workspaceId: ws.id, exists: true, name: ws.name, entitled: ws.addons.length > 0 });
    }

    if (userId) {
      if (!ID.test(userId)) return NextResponse.json({ error: "Bad userId" }, { status: 400 });
      const owned = await prisma.workspace.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          name: true,
          addons: { where: { addonType: "nonprofit", active: true }, select: { id: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      });
      return NextResponse.json({
        workspaces: owned.map((w) => ({ id: w.id, name: w.name, entitled: w.addons.length > 0 })),
      });
    }

    return NextResponse.json({ error: "Pass userId or workspaceId" }, { status: 400 });
  } catch (err: any) {
    console.error("NONPROFIT-OS ENTITLEMENT ERROR:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
