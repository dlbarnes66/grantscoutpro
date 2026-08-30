import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function POST() {
  const user = await requireUser();

  return NextResponse.json({
    success: false,
    message: "Two-factor authentication is not supported in this schema."
  });
}
