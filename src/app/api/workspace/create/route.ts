import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { workspaceId?: string } }) {
  try {
    const url = new URL(req.url);

    const workspaceId =
      params.workspaceId ??
      url.searchParams.get("workspaceId");

    return NextResponse.json({
      success: true,
      method: "GET",
      workspaceId,
    });
  } catch (err: any) {
    console.error("GET ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { workspaceId?: string } }) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    const workspaceId =
      params.workspaceId ??
      body.workspaceId ??
      url.searchParams.get("workspaceId");

    // TODO: implement real creation logic
    // Example:
    // const workspace = await prisma.workspace.create({
    //   data: {
    //     name: body.name,
    //     ownerId: body.ownerId,
    //   },
    // });

    return NextResponse.json({
      success: true,
      method: "POST",
      workspaceId,
      body,
    });
  } catch (err: any) {
    console.error("POST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
