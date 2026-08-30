import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await prisma.application.updateMany({
      data: { status: "archived" },
    });

    return NextResponse.json({
      success: true,
      archived: updated.count,
    });
  } catch (err: any) {
    console.error("ARCHIVE APPLICATIONS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
