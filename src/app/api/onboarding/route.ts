import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getFirecrawl } from "@/lib/firecrawl";
import { discoverOrganization } from "@/lib/organization-discovery";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: any): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    return NextResponse.json({
      success: true,
      method: "GET",
      params: context?.params ?? {},
      query: Object.fromEntries(url.searchParams.entries())
    });
  } catch (err: any) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: any
): Promise<Response> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Make sure our User table actually has a row for this Clerk user before
    // the profile upsert below tries to point a foreign key at it.
    await ensureUser();

    const body = await req.json().catch(() => ({}));

    const firecrawl = await getFirecrawl();

    console.log("Firecrawl initialized");

    const scrapeResult = await firecrawl.v1.scrapeUrl(
      body.website,
      {
        formats: ["markdown"],
      }
    );

    console.log("FIRECRAWL RESULT:", scrapeResult);

   const profile = await discoverOrganization(
  body.website
);

// Persist the discovered profile so it survives past this one response -
// previously this endpoint scraped the site and threw the result away.
// Social links come straight from the onboarding form (step 1), not
// from the site scrape - they're not something discoverOrganization()
// can infer, so pass through whatever the user typed. Empty strings
// are normalized to undefined so an unfilled field doesn't overwrite
// something the user already saved from Settings.
const linkedin = typeof body.linkedin === "string" && body.linkedin.trim() ? body.linkedin.trim() : undefined;
const facebook = typeof body.facebook === "string" && body.facebook.trim() ? body.facebook.trim() : undefined;
const instagram = typeof body.instagram === "string" && body.instagram.trim() ? body.instagram.trim() : undefined;

await prisma.userProfile.upsert({
  where: { userId },
  update: {
    organizationName: profile.organizationName,
    mission: profile.mission,
    website: profile.website,
    focusAreas: profile.keywords,
    ...(linkedin !== undefined ? { linkedin } : {}),
    ...(facebook !== undefined ? { facebook } : {}),
    ...(instagram !== undefined ? { instagram } : {}),
  },
  create: {
    userId,
    organizationName: profile.organizationName,
    mission: profile.mission,
    website: profile.website,
    focusAreas: profile.keywords,
    linkedin,
    facebook,
    instagram,
  },
});

return NextResponse.json(profile);
  } catch (err: any) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
 
