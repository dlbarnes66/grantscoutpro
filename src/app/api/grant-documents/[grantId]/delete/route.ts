import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: any) {
  const { grantId } = params;
  const { id } = await req.json();

  await prisma.grantDocument.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
