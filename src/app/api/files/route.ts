export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const files = await prisma.file.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const file = await prisma.file.create({
    data: {
      workspaceId: body.workspaceId,
      userId,
      documentId: body.documentId,
      filename: body.filename,
      mimeType: body.mimeType,
      size: body.size,
      url: body.url,
      storage: body.storage,
    },
  });

  return NextResponse.json(file);
}
