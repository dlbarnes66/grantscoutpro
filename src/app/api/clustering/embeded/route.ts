export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const embeddings = await prisma.embedding.findMany({
      where: { userId },
    });

    return NextResponse.json({ embeddings });
  } catch (err: any) {
    console.error("Embedding error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
