import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId, sessionClaims } = await await auth();
  if (!userId) {
    return NextResponse.json({ allowed: false }, { status: 401 });
  }
  return NextResponse.json({
    message: "Auth: permission check placeholder",
    allowed: true,
  });
}
