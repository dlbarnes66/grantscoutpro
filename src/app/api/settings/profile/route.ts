import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeProfileForClient } from "@/lib/profile/profilePatch";

export const dynamic = "force-dynamic";

// The signed-in user's own organization profile, so onboarding can be
// reopened later to review and update what was entered the first time.
export async function GET() {
  const user = await requireUser();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  return NextResponse.json({
    profile: serializeProfileForClient(profile as Record<string, any> | null, profile?.organizationType ?? ""),
    exists: !!profile,
  });
}
