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

    const history = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("Version history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
