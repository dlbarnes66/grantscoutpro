import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }) {
  const { workspaceId } = params;

  const documents = await prisma.document.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ documents });
}
