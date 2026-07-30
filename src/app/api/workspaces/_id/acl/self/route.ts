export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  const { workspaceId } = params;
  const auth = getAuth(req);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: auth.userId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    role: member.role,
  });
}
