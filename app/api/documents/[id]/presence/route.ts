import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const presence = await prisma.documentPresence.upsert({
    where: {
      documentId_userId: {
        documentId: params.id,
        userId,
      },
    },
    update: {
      lastSeen: new Date(),
    },
    create: {
      documentId: params.id,
      userId,
    },
  });

  return NextResponse.json(presence);
}
