import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, searches });
  } catch (err: any) {
    console.error("SAVED-SEARCHES GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name || !body.query) {
      return NextResponse.json({ error: "Missing name or query" }, { status: 400 });
    }

    const saved = await prisma.savedSearch.create({
      data: {
        userId,
        name: body.name,
        query: body.query,
      },
    });

    return NextResponse.json({ success: true, saved });
  } catch (err: any) {
    console.error("SAVED-SEARCHES POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
