import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const docs = await prisma.document.findMany({
    where: {
      title: { contains: q, mode: "insensitive" }
    },
    select: {
      id: true,
      title: true,
      createdAt: true
    },
    take: 50
  });

  return NextResponse.json(docs);
}
