import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { grantId } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    await prisma.grant.delete({ where: { id: grantId } });

    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error("Grant delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
