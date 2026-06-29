import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url, selectors } = await req.json();

    if (!url || !selectors) {
      return NextResponse.json(
        { error: "Missing url or selectors" },
        { status: 400 }
      );
    }

    const html = await fetch(url).then((res) => res.text());
    const $ = cheerio.load(html);

    const items = $(selectors.item).toArray();

    let imported = 0;

    for (const el of items) {
      const title = $(el).find(selectors.title).text().trim();
      const description = $(el).find(selectors.description).text().trim();

      await prisma.grant.create({
        data: {
          externalId: `${url}-${Math.random()}`,
          title: title || "Untitled Grant",
          description: description || "",
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
    console.error("HTML scraper error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
