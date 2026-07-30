export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canViewGrant, canEditGrant } from "@/lib/security/grant-acl";

// ⭐ GET → Load grant (requires canViewGrant)
export async function GET(req, { params }) {
  const { workspaceId, grantId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await canViewGrant(userId, grantId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    select: {
      id: true,
      title: true,
      agency: true,
      deadline: true,
      summary: true,
      updatedAt: true,
    },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  return NextResponse.json(grant);
}

// ⭐ POST → Save grant (requires canEditGrant)
export async function POST(req, { params }) {
  const { workspaceId, grantId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await canEditGrant(userId, grantId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, agency, deadline, summary } = await req.json();

  const updated = await prisma.grant.update({
    where: { id: grantId },
    data: {
      title,
      agency,
      deadline,
      summary,
    },
    select: {
      id: true,
      title: true,
      agency: true,
      deadline: true,
      summary: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}
