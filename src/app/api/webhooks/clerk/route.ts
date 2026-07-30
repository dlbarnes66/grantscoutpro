export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Clerk sends "data" containing the user
    const { data } = body;

    if (!data || !data.id || !data.email_addresses?.length) {
      return NextResponse.json(
        { error: "Invalid Clerk webhook payload" },
        { status: 400 }
      );
    }

    const email = data.email_addresses[0].email_address;

    // 1. Create Org for the user
    const org = await prisma.org.create({
      data: {
        name: `${email}'s Org`,
      },
    });

    // 2. Create Workspace (Workspace does NOT have orgId in your schema)
    const workspace = await prisma.workspace.create({
      data: {
        name: `${email}'s Workspace`,
        slug: `${data.id}-workspace`,
        ownerId: data.id, // This field DOES exist
      },
    });

    // 3. Create WorkspaceMember (correct relation)
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: data.id,
        role: "owner",
      },
    });

    return NextResponse.json({
      success: true,
      org,
      workspace,
    });
  } catch (err: any) {
    console.error("CLERK WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
