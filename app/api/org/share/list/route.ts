import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const owned = await prisma.sharedResource.findMany({
      where: { ownerOrgId: orgId },
      include: { access: true },
    });

    const accessible = await prisma.sharedAccess.findMany({
      where: { orgId },
      include: { shared: true },
    });

    return NextResponse.json({
      owned,
      accessible,
    });
  } catch (err: any) {
    console.error("Shared list error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
