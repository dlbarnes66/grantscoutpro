import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, orgId, requiredRole } = await req.json();

    if (!userId || !orgId || !requiredRole) {
      return NextResponse.json(
        { error: "Missing userId, orgId, or requiredRole" },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.findFirst({
      where: { userId, orgId },
    });

    if (!member) {
      return NextResponse.json({ allowed: false });
    }

    const allowed =
      member.role === requiredRole || member.role === "owner";

    return NextResponse.json({ allowed });
  } catch (err: any) {
    console.error("Permission check error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
