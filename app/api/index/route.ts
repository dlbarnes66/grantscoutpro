import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid URL" },
        { status: 400 }
      );
    }

    // Call Firecrawl
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!data || !data.content) {
      return NextResponse.json(
        { error: "Failed to scrape content" },
        { status: 500 }
      );
    }

    // Store in DB
    const page = await prisma.grantPage.upsert({
      where: { url },
      update: {
        title: data.metadata?.title || null,
        content: data.content || null,
      },
      create: {
        url,
        title: data.metadata?.title || null,
        content: data.content || null,
      },
    });

    return NextResponse.json(page);
  } catch (error: any) {
    console.error("Indexing error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
