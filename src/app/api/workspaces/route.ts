export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      trialActive: true,
      trialLocked: false,
    },
  });

  return NextResponse.json(workspace);
}
