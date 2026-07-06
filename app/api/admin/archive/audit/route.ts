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

    // Find old audit logs
    const logs = await prisma.auditLog.findMany({
      where: { createdAt: { lt: cutoff } },
    });

    // Delete them (archive = remove)
    await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    return NextResponse.json({
      archivedCount: logs.length,
      archivedIds: logs.map((l) => l.id),
    });
  } catch (err: any) {
    console.error("Audit Archive Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
