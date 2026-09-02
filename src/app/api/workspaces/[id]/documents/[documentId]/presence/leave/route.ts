import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

type Params = { id: string; documentId: string };

export async function POST(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = params;

  await prisma.documentPresence.deleteMany({
    where: {
      documentId,
      userId,
    },
  });

  return NextResponse.json({ success: true });
}
