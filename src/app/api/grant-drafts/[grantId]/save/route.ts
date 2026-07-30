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
  const { title, content } = await req.json();

  const draft = await prisma.grantDraft.create({
    data: {
      userId,
      grantId,
      title,
      content,
    },
  });

  return NextResponse.json(draft);
}
