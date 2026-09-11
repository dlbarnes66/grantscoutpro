import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

type Params = { id: string; documentId: string };

export async function POST(
  req: Request,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = params;

  // Optional: read status from body
  const body = await req.json().catch(() => ({}));
  const status = typeof body.status === "string" ? body.status : "online";

  await prisma.documentPresence.upsert({
    where: {
      documentId_userId: {
        documentId,
        userId,
      },
    },
    update: {
      lastSeen: new Date(),
      status,
    },
    create: {
      documentId,
      userId,
      lastSeen: new Date(),
      status,
    },
  });

  return NextResponse.json({ success: true });
}
