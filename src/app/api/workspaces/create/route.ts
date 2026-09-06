import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ error: "Missing workspace name" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });

    const workspace = await prisma.workspace.create({
      data: {
        name: body.name,
        slug,
        ownerId: userId,
      },
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: "owner",
      },
    });
    await prisma.workspaceBilling.create({
  data: {
    workspaceId: workspace.id,
    plan: "free",
  },
});

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error("WORKSPACE CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
