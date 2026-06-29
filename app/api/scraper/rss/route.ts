import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const parser = new Parser();

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const feed = await parser.parseURL(url);

    let imported = 0;

    for (const item of feed.items) {
      await prisma.grant.create({
        data: {
          externalId: item.guid ?? `${url}-${Math.random()}`,
          title: item.title ?? "Untitled Grant",
          description: item.contentSnippet ?? item.content ?? "",
          category: "General",
          deadline: null,
          industry: "",
          location: "",
          fundingRange: "",
        },
      });

      imported++;
    }

    return NextResponse.json({ imported });
  } catch (err: any) {
    console.error("RSS scraper error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
