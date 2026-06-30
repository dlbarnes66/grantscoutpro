import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const history = await prisma.eligibilityHistory.findMany({
      where: { userId },
      include: { grant: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("Eligibility history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
