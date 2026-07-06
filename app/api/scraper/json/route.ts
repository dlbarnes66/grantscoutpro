// app/api/scraper/json/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url, workspaceId } = await req.json();

    if (!url || !workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    const grants = await response.json();

    for (const grant of grants) {
      await prisma.grant.create({
        data: {
          workspaceId,
          title: grant.title || "Untitled Grant",
          description: grant.description || "",
          category: grant.category || "",
          agency: grant.agency || "",
          summary: grant.summary || "",
          amount: grant.amount ?? null,
          deadline: grant.deadline ? new Date(grant.deadline) : null,
          openDate: grant.openDate ? new Date(grant.openDate) : null,
          url: grant.url || "",
          industry: grant.industry || "",
          location: grant.location || "",
          fundingRange: grant.fundingRange || "",
          status: grant.status || "open",
          embedding: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "JSON grants imported successfully",
    });
  } catch (error) {
    console.error("SCRAPER JSON ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import JSON grants" },
      { status: 500 }
    );
  }
}
