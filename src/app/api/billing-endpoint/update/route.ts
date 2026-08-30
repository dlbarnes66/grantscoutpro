import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, fields } = body;

  if (!workspaceId || !fields) {
    return NextResponse.json(
      { error: "workspaceId and fields required" },
      { status: 400 }
    );
  }

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: fields,
  });

  return NextResponse.json({ updated: true });
}
