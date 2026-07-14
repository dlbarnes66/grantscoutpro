import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canViewGrant } from "@/lib/security/grant-acl";

export async function GET(req, { params }) {
  const { workspaceId, grantId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACL: View permission
  const allowed = await canViewGrant(userId, grantId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Load grant
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    select: {
      id: true,
      title: true,
      agency: true,
      deadline: true,
      summary: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  return NextResponse.json(grant);
}
