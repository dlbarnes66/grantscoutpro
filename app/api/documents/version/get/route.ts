import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { versionId } = await req.json();

    if (!versionId) {
      return NextResponse.json({ error: "Missing versionId" }, { status: 400 });
    }

    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
    });

    return NextResponse.json({ version });
  } catch (err: any) {
    console.error("Version fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
