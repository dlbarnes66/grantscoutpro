import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const log = await prisma.auditLog.findUnique({
      where: { id },
    });

    return NextResponse.json({ success: true, log });
  } catch (err: any) {
    console.error("AUDIT DETAIL ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
