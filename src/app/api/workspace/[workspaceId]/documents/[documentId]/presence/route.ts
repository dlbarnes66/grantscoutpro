import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ----------------------
// GET PRESENCE
// ----------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const url = new URL(req.url);

    const documentId =
      params.documentId ||
      params.id ||
      url.searchParams.get("documentId");

    const workspaceId =
      params.workspaceId ||
      url.searchParams.get("workspaceId");

    // ⭐ PLACEHOLDER: your original GET logic goes here
    // Example:
    // const presence = await prisma.documentPresence.findMany({
    //   where: { docId: documentId }
    // });

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId,
      // presence,
    });
  } catch (err: any) {
    console.error("GET PRESENCE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

// ----------------------
// POST PRESENCE UPDATE
// ----------------------
export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    const documentId =
      params.documentId ||
      params.id ||
      body.documentId ||
      url.searchParams.get("documentId");

    const workspaceId =
      params.workspaceId ||
      body.workspaceId ||
      url.searchParams.get("workspaceId");

    // ⭐ PLACEHOLDER: your original POST logic goes here
    // Example:
    // const updatedPresence = await prisma.documentPresence.upsert({
    //   where: { docId_userId: { docId: documentId, userId: body.userId } },
    //   update: { status: body.status },
    //   create: {
    //     docId: documentId,
    //     userId: body.userId,
    //     status: body.status
    //   }
    // });

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body,
      // updatedPresence,
    });
  } catch (err: any) {
    console.error("POST PRESENCE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
