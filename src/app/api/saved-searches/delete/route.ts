import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchId } = await req.json().catch(() => null);
    if (!searchId) return NextResponse.json({ error: "Missing searchId" }, { status: 400 });

    await prisma.savedSearch.delete({
      where: { id: searchId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SAVED-SEARCH DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
