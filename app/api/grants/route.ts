import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grants = await prisma.grant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(grants);
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    workspaceId,
    title,
    description,
    category,
    agency,
    summary,
    amount,
    deadline,
    url,
  } = body;

  const grant = await prisma.grant.create({
    data: {
      workspaceId,
      title,
      description,
      category,
      agency,
      summary,
      amount,
      deadline,
      url,
    },
  });

  return NextResponse.json(grant);
}
