// app/grant-comparisons/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const orgId = session?.user?.orgId;

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, grantIds } = body;

  if (!workspaceId || !Array.isArray(grantIds)) {
    return NextResponse.json(
      { error: "workspaceId and grantIds[] are required" },
      { status: 400 }
    );
  }

  // ⭐ Create comparison using your actual Prisma model
  const comparison = await prisma.grantComparison.create({
    data: {
      userId,
      workspaceId,
      grants: grantIds, // JSON array of grant IDs
    },
  });

  return NextResponse.json(comparison);
}
