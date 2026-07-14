import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireGrantAI } from "@/lib/security/grant-acl";

export async function POST(req, { params }) {
  const { workspaceId, grantId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACL: AI permission
  const allowed = await requireGrantAI(userId, grantId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { mode } = await req.json();

  // Load grant data
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

  // Example scoring logic (replace with your real AI logic)
  let result;

  switch (mode) {
    case "eligibility":
      result = {
        score: Math.random() * 100,
        notes: "Eligibility score based on summary and agency requirements.",
      };
      break;

    case "compliance":
      result = {
        score: Math.random() * 100,
        notes: "Compliance score based on grant constraints.",
      };
      break;

    case "risk":
      result = {
        score: Math.random() * 100,
        notes: "Risk score based on deadlines and agency history.",
      };
      break;

    case "fit":
      result = {
        score: Math.random() * 100,
        notes: "Fit score based on your organization profile.",
      };
      break;

    default:
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  return NextResponse.json(result);
}
