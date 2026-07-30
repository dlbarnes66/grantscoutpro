import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  return NextResponse.json({ billing, workspace });
}
