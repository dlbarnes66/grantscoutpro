import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUSES = ["open", "in_progress", "resolved"] as const;

// PATCH { status?, adminNotes? } -> superadmin-only triage update.
export async function PATCH(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ ticketId: string }> }
) {
  const params = await paramsPromise;
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const data: { status?: string; adminNotes?: string } = {};

  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: `status must be one of: ${STATUSES.join(", ")}` }, { status: 400 });
    }
    data.status = body.status;
  }
  if (typeof body.adminNotes === "string") {
    data.adminNotes = body.adminNotes;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  const existing = await prisma.ticket.findUnique({ where: { id: params.ticketId }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updated = await prisma.ticket.update({ where: { id: params.ticketId }, data });

  return NextResponse.json({ success: true, ticket: updated });
}
