import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: any) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ application: null, versions: [] }, { status: 401 });
  }

  const { grantId } = params;

  const application = await prisma.application.findFirst({
    where: {
      grantId,
      userId,
    },
    include: { versions: true },
  });

  return NextResponse.json({
    application,
    versions: application?.versions || [],
  });
}
