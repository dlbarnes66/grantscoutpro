import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const grantId = req.nextUrl.searchParams.get("grantId");
  if (!grantId) {
    return NextResponse.json({ error: "grantId is required" }, { status: 400 });
  }

  try {
    const access = await prisma.grantAccess.findFirst({
      where: { grantId, userId },
    });

    return NextResponse.json({ success: true, access: !!access });
  } catch (err: any) {
    console.error("GRANT ACCESS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
