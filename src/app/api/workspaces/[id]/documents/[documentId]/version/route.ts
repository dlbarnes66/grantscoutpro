import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

type Params = { id: string; documentId: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = params;

  const versions = await prisma.documentVersion.findMany({
    where: {
      document: {
        id: documentId,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, versions });
}

export async function POST(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = params;

  const doc = await prisma.workspaceDocument.findUnique({
    where: { id: documentId },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const version = await prisma.documentVersion.create({
    data: {
      document: { connect: { id: documentId } },
      user: { connect: { id: userId } },
      content: doc.content as any,
    },
  });

  return NextResponse.json({ success: true, version });
}
