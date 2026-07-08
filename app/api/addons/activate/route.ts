import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { workspaceId, addonId } = await req.json();

    if (!workspaceId || !addonId) {
      return NextResponse.json(
        { error: "Missing workspaceId or addonId" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        addons: {
          push: addonId
        }
      }
    });

    return NextResponse.json({ activated: true, workspace });
  } catch (err: any) {
    console.error("Addon activation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
