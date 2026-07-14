import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  const { workspaceId, grantId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId: auth.userId,
      },
    },
    select: {
      canView: true,
      canEdit: true,
      canRunAI: true,
    },
  });

  if (!access) {
    return NextResponse.json(
      { canView: false, canEdit: false, canRunAI: false },
      { status: 200 }
    );
  }

  return NextResponse.json(access);
}
