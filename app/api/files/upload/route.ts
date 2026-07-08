import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, workspaceId, filename, base64, mimeType, size } =
      await req.json();

    if (!userId || !workspaceId || !filename || !base64 || !mimeType || !size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In your system, files are stored externally (Supabase, S3, etc.)
    // So the Prisma record stores metadata only.
    const file = await prisma.file.create({
      data: {
        userId,
        workspaceId,
        name: filename,     // FIXED
        url: "",            // You will fill this with your upload URL later
        type: mimeType,     // FIXED
        size,               // FIXED
      },
    });

    return NextResponse.json({ success: true, file });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
