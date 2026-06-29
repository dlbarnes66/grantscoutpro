import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, newOrgId } = await req.json();

    if (!userId || !newOrgId) {
      return NextResponse.json(
        { error: "Missing userId or newOrgId" },
        { status: 400 }
      );
    }

    const apps = await prisma.application.updateMany({
      where: { userId },
      data: { orgId: newOrgId },
    });

    return NextResponse.json({ moved: apps.count });
  } catch (err: any) {
    console.error("Move applications error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
