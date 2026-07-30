export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "Missing key" },
        { status: 400 }
      );
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
    });

    return NextResponse.json({ valid: !!apiKey });
  } catch (err: any) {
    console.error("API key validation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
