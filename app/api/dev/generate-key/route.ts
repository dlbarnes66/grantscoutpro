import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const apiKey = crypto.randomBytes(32).toString("hex");

    const keyRecord = await prisma.apiKey.upsert({
      where: { userId },
      update: { key: apiKey },
      create: { userId, key: apiKey },
    });

    return NextResponse.json({ apiKey: keyRecord.key });
  } catch (err: any) {
    console.error("API key generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
