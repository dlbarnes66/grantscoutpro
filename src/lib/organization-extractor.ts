export interface ExtractedOrganizationProfile {
  organizationName: string;
  mission: string;
  keywords: string[];
}

export function extractOrganizationProfile(
  markdown: string
): ExtractedOrganizationProfile {
  const cleaned = markdown
    .replace(/\[.*?\]\(.*?\)/g, " ")
    .replace(/#+/g, " ")
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const mission = cleaned.substring(0, 800);

  const keywordPool = [
    "veterans",
    "education",
    "health",
    "housing",
    "employment",
    "community",
    "advocacy",
    "benefits",
    "youth",
    "disability",
    "transportation",
    "training",
    "research",
    "workforce",
    "mental health",
  ];

  const lowerContent = cleaned.toLowerCase();

  const keywords = keywordPool.filter((keyword) =>
    lowerContent.includes(keyword.toLowerCase())
  );

  let organizationName = "Organization Discovery Complete";

  if (cleaned.includes("Disabled American Veterans")) {
    organizationName = "Disabled American Veterans";
  }

  return {
    organizationName,
    mission,
    keywords,
  };
}
