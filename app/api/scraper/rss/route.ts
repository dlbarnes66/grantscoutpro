// app/api/scraper/rss/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Parser from "rss-parser";

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

    const parser = new Parser();
    const feed = await parser.parseURL(url);

    for (const item of feed.items) {
      await prisma.grant.create({
        data: {
          workspaceId,
          title: item.title ?? "Untitled Grant",
          description: item.contentSnippet ?? item.content ?? "",
          category: "General",
          agency: "",
          summary: "",
          amount: null,
          deadline: null,
          openDate: null,
          url: item.link ?? "",
          industry: "",
          location: "",
          fundingRange: "",
          status: "open",
          embedding: [], // required by your schema
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "RSS grants imported successfully",
    });
  } catch (error) {
    console.error("SCRAPER RSS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import RSS grants" },
      { status: 500 }
    );
  }
}
