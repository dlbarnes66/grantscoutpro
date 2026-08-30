import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, seats } = body;

  if (!workspaceId || !seats) {
    return NextResponse.json(
      { error: "workspaceId and seats required" },
      { status: 400 }
    );
  }

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: { seats },
  });

  return NextResponse.json({ updated: true, seats });
}
