import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Grant Scout Advisor
 * Option 2: Ask Before Updating Profile
 * Monitors: Social Media, Workspace, Files, CRM, Scrapers
 * Purpose: Detect gaps, recommend improvements, notify user, request profile updates
 */

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const {
      profile,
      grant,
      signals = {},
      workspaceActivity = [],
      uploadedFiles = [],
      socialMedia = [],
      crm = [],
      scraperUpdates = [],
    } = body;

    // Basic validation
    if (!profile || !grant) {
      return NextResponse.json(
        { error: "Missing profile or grant data" },
        { status: 400 }
      );
    }

    // --- STEP 1: Extract eligibility criteria ---
    const eligibilityCriteria = grant.eligibility || [];

    // --- STEP 2: Compare profile to eligibility ---
    const gaps = [];
    const improvements = [];

    for (const criterion of eligibilityCriteria) {
      const { field, required, description } = criterion;

      const userValue = profile[field];

      if (!userValue || userValue === "" || userValue === null) {
        gaps.push({
          field,
          description,
          missing: required,
        });

        improvements.push({
          field,
          recommendation: `Add or update your ${field} to meet eligibility: ${description}`,
        });
      }
    }

    // --- STEP 3: Detect new information from signals ---
    const newInfo = [];

    const allSignals = [
      ...socialMedia,
      ...workspaceActivity,
      ...uploadedFiles,
      ...crm,
      ...scraperUpdates,
      ...(signals.extra || []),
    ];

    for (const signal of allSignals) {
      if (signal && signal.type && signal.value) {
        newInfo.push(signal);
      }
    }

    // --- STEP 4: Determine if new info improves eligibility ---
    const potentialUpdates = [];

    for (const info of newInfo) {
      if (gaps.some((g) => g.field === info.type)) {
        potentialUpdates.push({
          field: info.type,
          value: info.value,
          reason: "Detected new information that fills an eligibility gap.",
        });
      }
    }

    // --- STEP 5: If updates exist, ask user for approval ---
    if (potentialUpdates.length > 0) {
      return NextResponse.json({
        success: true,
        advisor: "grant-scout",
        action: "request-profile-update",
        message:
          "New information detected that may improve your eligibility. Would you like to update your profile?",
        potentialUpdates,
        gaps,
        improvements,
      });
    }

    // --- STEP 6: If no updates, return gap analysis ---
    return NextResponse.json({
      success: true,
      advisor: "grant-scout",
      action: "gap-analysis",
      gaps,
      improvements,
      message:
        gaps.length === 0
          ? "Your profile fully meets eligibility criteria."
          : "You are close to eligibility. Here is what you need to improve.",
    });
  } catch (err: any) {
    console.error("GRANT SCOUT ADVISOR ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
