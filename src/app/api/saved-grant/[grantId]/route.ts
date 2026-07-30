import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: any) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { grantId } = params;

  await prisma.savedGrant.create({
    data: {
      userId,
      grantId,
    },
  });

  return NextResponse.json({ ok: true });
}
