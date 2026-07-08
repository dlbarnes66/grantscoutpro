// app/api/scraper/html/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as cheerio from "cheerio";

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
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("title").text();
    const description = $("meta[name='description']").attr("content") || "";

    await prisma.grant.create({
      data: {
        workspaceId,
        title: title || "Untitled Grant",
        description: description || "",
        category: "General",
        agency: "",
        summary: "",
        amount: null,
        deadline: null,
        openDate: null,
        url,
        industry: "",
        location: "",
        fundingRange: "",
        status: "open",
        embedding: [], // required by your schema
      },
    });

    return NextResponse.json({
      success: true,
      message: "Grant scraped and saved",
    });
  } catch (error) {
    console.error("SCRAPER HTML ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to scrape HTML" },
      { status: 500 }
    );
  }
}
