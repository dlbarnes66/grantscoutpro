// app/api/sso/provision/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing email" },
        { status: 400 }
      );
    }

    const domain = email.split("@")[1];

    // ⭐ STEP 1 — Find or create Org (search by name, since domain doesn't exist)
    const orgName = `${domain} Org`;

    let org = await prisma.org.findFirst({
      where: { name: orgName },
    });

    if (!org) {
      org = await prisma.org.create({
        data: {
          name: orgName,
        },
      });
    }

    // ⭐ STEP 2 — Find or create Workspace under this Org
    const workspaceName = `${domain} Workspace`;

    let workspace = await prisma.workspace.findFirst({
      where: {
        name: workspaceName,
        orgId: org.id,
      },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
          orgId: org.id, // ⭐ REQUIRED
        },
      });
    }

    // ⭐ STEP 3 — Find or create User
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || "",
        },
      });
    }

    // ⭐ STEP 4 — Add user to workspace if not already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    });

    if (!existingMember) {
      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: "member",
        },
      });
    }

    return NextResponse.json({
      success: true,
      org,
      workspace,
      user,
    });
  } catch (error) {
    console.error("SSO PROVISION ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to provision SSO user" },
      { status: 500 }
    );
  }
}
