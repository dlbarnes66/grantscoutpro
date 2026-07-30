export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { docId, content } = await req.json();

    if (!docId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing docId or content" },
        { status: 400 }
      );
    }

    // ✔ Correct Prisma model name: Document
    const updated = await prisma.document.update({
      where: { id: docId },
      data: { content },
    });

    return NextResponse.json({
      success: true,
      document: updated,
    });
  } catch (err: any) {
    console.error("COLLAB EDIT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
