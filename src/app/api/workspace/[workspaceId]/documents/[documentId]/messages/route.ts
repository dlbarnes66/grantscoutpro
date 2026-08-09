import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ----------------------
// GET MESSAGES
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
    // const messages = await prisma.documentMessage.findMany({
    //   where: { documentId },
    //   orderBy: { createdAt: "asc" }
    // });

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId,
      // messages,
    });
  } catch (err: any) {
    console.error("GET ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

// ----------------------
// POST MESSAGE
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
    // const newMessage = await prisma.documentMessage.create({
    //   data: {
    //     documentId,
    //     userId: body.userId,
    //     message: body.message
    //   }
    // });

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body,
      // newMessage,
    });
  } catch (err: any) {
    console.error("POST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
