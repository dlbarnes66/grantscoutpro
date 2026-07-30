export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canRunGrantAI } from "@/lib/security/grant-acl";

export async function POST(req, { params }) {
  const { workspaceId, grantId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACL: AI permission
  const allowed = await canRunGrantAI(userId, grantId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { prompt } = await req.json();

  // Load grant data for context
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    select: {
      title: true,
      agency: true,
      summary: true,
      deadline: true,
    },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  // Your AI logic goes here
  const aiResponse = `AI analysis for ${grant.title}: ${prompt}`;

  return NextResponse.json({ result: aiResponse });
}
