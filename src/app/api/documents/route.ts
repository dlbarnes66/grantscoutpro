export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { workspaceId, title, content } = body;

  const doc = await prisma.document.create({
    data: {
      workspaceId,
      userId,
      title,
      content,
    },
  });

  return NextResponse.json(doc);
}

