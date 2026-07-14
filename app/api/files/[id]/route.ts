import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const file = await prisma.file.findUnique({
    where: { id: params.id },
    include: {
      FileEmbedding: true,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json(file);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.file.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ deleted: true });
}
