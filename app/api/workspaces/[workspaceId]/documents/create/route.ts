import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }) {
  const { workspaceId } = params;
  const { title } = await req.json();

  const doc = await prisma.document.create({
    data: {
      title,
      workspaceId
    }
  });

  return NextResponse.json({ documentId: doc.id });
}
