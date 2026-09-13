import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const TICKET_TYPES = ["problem", "suggestion"] as const;

// Owners/admins can file a problem report or suggestion from inside
// their workspace. Deliberately no GET here: by design, the submitter
// doesn't get a status view back (see /api/admin/tickets) - triage and
// follow-up happen superadmin-side, kept simple for the pilot.
export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: true },
    });
    if (!workspace || workspace.deletedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const me =
      workspace.ownerId === userId
        ? { role: "owner" as const }
        : workspace.members.find((m) => m.userId === userId);

    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can submit a ticket." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const type = body?.type as string | undefined;
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";

    if (!type || !TICKET_TYPES.includes(type as (typeof TICKET_TYPES)[number])) {
      return NextResponse.json({ error: `type must be one of: ${TICKET_TYPES.join(", ")}` }, { status: 400 });
    }
    if (!subject) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    if (subject.length > 200) return NextResponse.json({ error: "Subject is too long" }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (description.length > 5000) return NextResponse.json({ error: "Description is too long" }, { status: 400 });

    const ticket = await prisma.ticket.create({
      data: {
        orgId: workspace.orgId,
        workspaceId: workspace.id,
        submittedById: userId,
        type,
        subject,
        description,
      },
    });

    return NextResponse.json({ success: true, ticket: { id: ticket.id } }, { status: 201 });
  } catch (err: any) {
    console.error("WORKSPACE TICKETS POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
