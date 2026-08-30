import { getFirecrawl } from "@/lib/firecrawl";
import { extractOrganizationProfile } from "@/lib/organization-extractor";
``

export interface OrganizationProfile {
  organizationName: string;
  mission: string;
  website: string;
  keywords: string[];
  rawMarkdown: string;
}

export async function discoverOrganization(
  website: string
): Promise<OrganizationProfile> {
  const firecrawl = await getFirecrawl();

  const scrapeResult = await firecrawl.v1.scrapeUrl(
    website,
    {
      formats: ["markdown"],
    }
  );

  console.log(
    "ORGANIZATION DISCOVERY:",
    JSON.stringify(scrapeResult, null, 2)
  );

  const markdown =
    (scrapeResult as any)?.data?.markdown ??
    (scrapeResult as any)?.markdown ??
    "";

  const cleanedMission = markdown
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 600);

  const extracted =
  extractOrganizationProfile(markdown);

return {
  organizationName:
    extracted.organizationName,

  mission:
    extracted.mission,

  website,

  keywords:
    extracted.keywords,

  rawMarkdown: markdown,
};
}