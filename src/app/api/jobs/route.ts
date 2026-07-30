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

    const userId = session.user.id;
    const body = await req.json();

    if (!body?.text) {
      return NextResponse.json(
        { error: "Missing search text" },
        { status: 400 }
      );
    }

    // Simulated job result
    const job = {
      id: crypto.randomUUID(),
      title: "Grant Writer Position",
      company: "Nonprofit Org",
      location: "Remote",
      description: "Assist with grant writing and submissions.",
    };

    // Save search history (ONLY valid fields)
    await prisma.searchHistory.create({
      data: {
        userId,
        query: body.text,
      },
    });

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (err: any) {
    console.error("JOB SEARCH ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
