import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, filename, base64 } = await req.json();

    if (!userId || !filename || !base64) {
      return NextResponse.json(
        { error: "Missing userId, filename, or base64" },
        { status: 400 }
      );
    }

    const file = await prisma.file.create({
      data: {
        userId,
        filename,
        content: base64,
      },
    });

    return NextResponse.json({ file });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
