export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { orgName, workspaceName } = await req.json();

    if (!orgName || !workspaceName) {
      return NextResponse.json(
        { error: "Missing orgName or workspaceName" },
        { status: 400 }
      );
    }

    // Create Org (simple model)
    const org = await prisma.org.create({
      data: {
        name: orgName,
      },
    });

    // Workspace requires: name, slug, owner relation
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: slugify(workspaceName),
        owner: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({
      success: true,
      org,
      workspace,
    });
  } catch (err: any) {
    console.error("SSO PROVISION ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

