import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { days } = await req.json();

    if (!days || typeof days !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid 'days' parameter" },
        { status: 400 }
      );
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Archive old grant drafts (closest match to “applications”)
    const drafts = await prisma.grantDraft.findMany({
      where: { createdAt: { lt: cutoff } },
    });

    return NextResponse.json({
      archivedCount: drafts.length,
      archivedIds: drafts.map((d) => d.id),
    });
  } catch (err: any) {
    console.error("Archive Applications Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
