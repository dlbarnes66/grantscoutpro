export interface AIOrganizationProfile {
  organizationName: string;
  mission: string;
  focusAreas: string[];
  keywords: string[];
  serviceAreas: string[];
}

export async function extractOrganizationWithAI(
  markdown: string
): Promise<AIOrganizationProfile> {
  const cleaned = markdown
    .replace(/\[.*?\]\(.*?\)/g, " ")
    .replace(/#+/g, " ")
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const lower = cleaned.toLowerCase();

  const focusAreas: string[] = [];

  if (
    lower.includes("veteran") ||
    lower.includes("military")
  ) {
    focusAreas.push("Veteran Services");
  }

  if (
    lower.includes("housing") ||
    lower.includes("homeless")
  ) {
    focusAreas.push("Housing");
  }

  if (
    lower.includes("health") ||
    lower.includes("medical")
  ) {
    focusAreas.push("Healthcare");
  }

  if (
    lower.includes("education") ||
    lower.includes("school")
  ) {
    focusAreas.push("Education");
  }

  if (
    lower.includes("research")
  ) {
    focusAreas.push("Research");
  }

  if (
    lower.includes("community")
  ) {
    focusAreas.push("Community Development");
  }

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
    "medical",
    "school",
    "students",
    "economic development",
  ];

  const keywords = keywordPool.filter((keyword) =>
    lower.includes(keyword.toLowerCase())
  );

  const organizationName =
    "Organization Discovery Pending";

  const mission = cleaned.substring(0, 1200);

  return {
    organizationName,
    mission,
    focusAreas,
    keywords,
    serviceAreas: [],
  };
}