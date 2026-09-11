import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

type Params = { id: string; documentId: string; versionId: string };

export async function POST(
  _req: Request,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId, versionId } = params;

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  await prisma.workspaceDocument.update({
    where: { id: documentId },
    data: {
      content: version.content as any, // JSON-safe restore
    },
  });

  return NextResponse.json({ success: true });
}
