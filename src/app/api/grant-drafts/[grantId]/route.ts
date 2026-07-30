import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: any) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    // Return empty list if not authenticated (same behavior as before)
    return NextResponse.json([], { status: 200 });
  }

  const { grantId } = params;

  const drafts = await prisma.grantDraft.findMany({
    where: {
      grantId,
      userId,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(drafts);
}
