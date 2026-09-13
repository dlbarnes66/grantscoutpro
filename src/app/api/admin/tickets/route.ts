import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Superadmin-only list of every ticket filed across every workspace -
// same sessionClaims.superAdmin pattern as /api/admin/workspace/update.
// By design there's no workspace-facing GET (see
// /api/workspaces/[id]/tickets): triage happens here only.
export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      workspace: { select: { id: true, name: true } },
      org: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ success: true, tickets });
}
