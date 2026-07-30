import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: any) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { grantId } = params;
  const { content } = await req.json();

  // Create application
  const application = await prisma.application.create({
    data: {
      userId,
      grantId,
      content,
    },
  });

  // Create first version
  await prisma.applicationVersion.create({
    data: {
      applicationId: application.id,
      content,
    },
  });

  return NextResponse.json(application);
}
