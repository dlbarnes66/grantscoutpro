import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const saved = await prisma.savedGrant.findMany({
      where: { userId },
      include: { grant: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, savedGrants: saved });
  } catch (err: any) {
    console.error("SAVED-GRANTS LIST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
