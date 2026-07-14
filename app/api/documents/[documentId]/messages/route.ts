import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const msg = await prisma.documentMessage.create({
    data: {
      documentId: params.id,
      userId,
      message: body.message,
    },
  });

  return NextResponse.json(msg);
}
