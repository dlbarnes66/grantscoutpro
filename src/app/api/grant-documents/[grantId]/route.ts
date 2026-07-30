import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { grantId } = params;

  const docs = await prisma.grantDocument.findMany({
    where: { grantId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}
