export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceId, json } = body;

    if (!workspaceId || !json) {
      return NextResponse.json(
        { error: "Missing workspaceId or json" },
        { status: 400 }
      );
    }

    // Extract fields safely
    const title = json.title ?? "Untitled Grant";
    const summary = json.summary ?? null;
    const description = json.description ?? null;
    const category = json.category ?? null;
    const agency = json.agency ?? null;
    const amount = json.amount ?? null;
    const deadline = json.deadline ? new Date(json.deadline) : null;
    const industry = json.industry ?? null;
    const location = json.location ?? null;

    // Save to database (correct model: Grant)
    const saved = await prisma.grant.create({
      data: {
        workspaceId,
        title,
        summary,
        description,
        category,
        agency,
        amount,
        deadline,
        industry,
        location
        // url removed because it does not exist in the Grant model
      },
    });

    return NextResponse.json({
      success: true,
      grant: saved,
    });
  } catch (err: any) {
    console.error("EXTRACT GRANT ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
