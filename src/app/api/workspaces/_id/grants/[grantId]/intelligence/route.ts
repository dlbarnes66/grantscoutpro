export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canRunGrantAI } from "@/lib/security/grant-acl";

export async function POST(req, { params }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const grantId = params.grant;

  // ACL: AI permission
  const allowed = await canRunGrantAI(userId, grantId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Load grant
  const grant = await prisma.grant.findUnique({
    where: { id: grantId }
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  // Placeholder AI logic
  return NextResponse.json({
    success: true,
    message: "AI processing completed",
    grantId
  });
}
