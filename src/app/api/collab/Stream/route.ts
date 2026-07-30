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

    const { docId } = await req.json();

    if (!docId) {
      return NextResponse.json(
        { success: false, error: "Missing docId" },
        { status: 400 }
      );
    }

    // ✔ Correct Prisma model name: Document
    const doc = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document: doc,
    });
  } catch (err: any) {
    console.error("COLLAB STREAM ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
