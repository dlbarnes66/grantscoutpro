import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { narrativeId } = params;

  const entry = await prisma.narrative.findUnique({
    where: { id: narrativeId },
  });

  return NextResponse.json(entry);
}

export async function PUT(req: Request, { params }: any) {
  const { narrativeId } = params;
  const { content } = await req.json();

  const entry = await prisma.narrative.update({
    where: { id: narrativeId },
    data: { content },
  });

  return NextResponse.json(entry);
}

export async function DELETE(req: Request, { params }: any) {
  const { narrativeId } = params;

  await prisma.narrative.delete({
    where: { id: narrativeId },
  });

  return NextResponse.json({ success: true });
}
