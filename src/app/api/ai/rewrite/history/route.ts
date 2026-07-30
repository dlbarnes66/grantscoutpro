export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const history = await prisma.rewriteHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("Rewrite history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
