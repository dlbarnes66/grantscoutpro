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
  const { content } = await req.json();

  const entry = await prisma.narrative.create({
    data: {
      grantId,
      userId,
      content,
    },
  });

  return NextResponse.json(entry);
}
