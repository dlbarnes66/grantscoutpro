export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { name, owner } = await req.json();

    if (!name || !owner) {
      return NextResponse.json(
        { error: "Workspace name and owner are required." },
        { status: 400 }
      );
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + "-" + nanoid(6);

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        owner,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Workspace creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create workspace." },
      { status: 500 }
    );
  }
}
