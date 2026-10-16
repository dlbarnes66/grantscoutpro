import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sanitizeProfilePatch } from "@/lib/profile/profilePatch";

// User-level profile save used by onboarding. Only whitelisted, validated
// profile fields are written (see sanitizeProfilePatch) - this used to pass
// body.profile straight to prisma, which would have let a caller set any
// column on their profile row, including userId.
export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const patch = sanitizeProfilePatch(body.profile ?? {}, { allowOrganizationType: true });
  if ("error" in patch) {
    return NextResponse.json({ error: patch.error }, { status: 400 });
  }

  const userData: { name?: string; image?: string } = {};
  if (typeof body.name === "string") userData.name = body.name.trim().slice(0, 200);
  if (typeof body.image === "string") userData.image = body.image.slice(0, 2000);

  const updatedUser = Object.keys(userData).length
    ? await prisma.user.update({ where: { id: user.id }, data: userData })
    : user;

  const updatedProfile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: patch.data,
    create: { userId: user.id, ...patch.data },
  });

  return NextResponse.json({
    user: updatedUser,
    profile: updatedProfile,
  });
}
