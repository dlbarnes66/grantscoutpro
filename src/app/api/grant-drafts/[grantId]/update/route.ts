import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: any) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, title, content } = await req.json();

  const draft = await prisma.grantDraft.update({
    where: { id },
    data: {
      title,
      content,
    },
  });

  return NextResponse.json(draft);
}
