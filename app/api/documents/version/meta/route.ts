import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { createdAt: "asc" },
      include: { user: true },
    });

    const meta = versions.map((v, idx) => ({
      versionId: v.id,
      versionNumber: idx + 1,
      editedBy: v.user?.name ?? "Unknown",
      editedAt: v.createdAt,
    }));

    return NextResponse.json({ meta });
  } catch (err: any) {
    console.error("Version metadata error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
