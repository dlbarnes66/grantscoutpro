import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: String } }
) {
  try {
    const grant = await prisma.savedGrant.findUnique({
      where: { id: params.id as string },
      include: {
        grant: true, // GrantPreview
      },
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    return NextResponse.json(grant);
  } catch (error) {
    console.error("Error fetching saved grant:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved grant" },
      { status: 500 }
    );
  }
}
