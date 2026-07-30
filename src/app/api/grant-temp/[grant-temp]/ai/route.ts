import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { grantId } = params;

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  return NextResponse.json(grant);
}
