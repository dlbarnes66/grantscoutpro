import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: any) {
  const { docId } = params;

  await prisma.grantDocument.delete({
    where: { id: docId },
  });

  return NextResponse.json({ success: true });
}
