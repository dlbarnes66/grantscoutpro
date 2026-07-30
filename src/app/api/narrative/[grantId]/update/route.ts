import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: any) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, content } = await req.json();

  // Update narrative entry
  const updated = await prisma.narrative.update({
    where: { id },
    data: { content },
  });

  return NextResponse.json(updated);
}
