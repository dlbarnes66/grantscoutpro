import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { applicationId } = params;

  const versions = await prisma.applicationVersion.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(versions);
}
