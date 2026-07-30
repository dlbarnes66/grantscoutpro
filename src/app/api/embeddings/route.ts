export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const body = await req.json();

    const workspaceId = body.workspaceId;
    const documentId = body.documentId ?? null;
    const vector = body.vector;

    // Ensure userId is either string or null
    const userId =
      typeof body.userId === "string" ? body.userId : null;

    if (!workspaceId || !vector) {
      return NextResponse.json(
        { error: "Missing workspaceId or vector" },
        { status: 400 }
      );
    }

    const embedding = await prisma.embedding.create({
      data: {
        workspaceId,
        documentId,
        userId,        // ✔ safe, validated
        vector,
        // ❌ GrantPage removed — undefined is invalid
      },
    });

    return NextResponse.json({ embedding });
  } catch (err: any) {
    console.error("EMBEDDINGS ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
