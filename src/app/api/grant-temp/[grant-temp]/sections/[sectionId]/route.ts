import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { sectionId } = params;

  const section = await prisma.grantSection.findUnique({
    where: { id: sectionId },
  });

  return NextResponse.json(section);
}

export async function PUT(req: Request, { params }: any) {
  const { sectionId } = params;
  const { title, content } = await req.json();

  const section = await prisma.grantSection.update({
    where: { id: sectionId },
    data: { title, content },
  });

  return NextResponse.json(section);
}

export async function DELETE(req: Request, { params }: any) {
  const { sectionId } = params;

  await prisma.grantSection.delete({
    where: { id: sectionId },
  });

  return NextResponse.json({ success: true });
}
