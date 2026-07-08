import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const history = await prisma.successProbabilityHistory.findMany({
      where: { userId },
      include: { grant: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("Success probability history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
