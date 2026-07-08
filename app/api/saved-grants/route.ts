import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const grants = await prisma.savedGrant.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        grant: true, // GrantPreview
      },
    });

    return NextResponse.json(grants);
  } catch (error) {
    console.error("Error fetching saved grants:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved grants" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const grant = await prisma.savedGrant.create({
      data: {
        userId,
        grantId: data.grantId,
        title: data.title,
        agency: data.agency,
        url: data.url,
      },
    });

    return NextResponse.json(grant);
  } catch (error) {
    console.error("Error saving grant:", error);
    return NextResponse.json(
      { error: "Failed to save grant" },
      { status: 500 }
    );
  }
}
