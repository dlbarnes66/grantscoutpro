import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ "grant-temp": string }> }
) {
  // Next.js thinks params is a Promise and the key is "grant-temp"
  const params = await context.params;
  const grantId = params["grant-temp"];

  try {
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(grant);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to load grant" },
      { status: 500 }
    );
  }
}
