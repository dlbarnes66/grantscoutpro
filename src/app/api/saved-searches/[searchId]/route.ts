import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ searchId: string }> }
) {
  try {
    const { searchId } = await context.params;

    if (!searchId) {
      return NextResponse.json(
        { error: "Missing searchId" },
        { status: 400 }
      );
    }

    // Fetch the saved search
    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id: searchId }
    });

    if (!savedSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    // Run the search again to fetch matching grants
    const grants = await prisma.grant.findMany({
      where: {
        OR: [
          { title: { contains: savedSearch.query, mode: "insensitive" } },
          { summary: { contains: savedSearch.query, mode: "insensitive" } },
          { description: { contains: savedSearch.query, mode: "insensitive" } }
        ]
      },
      include: {
        workspace: true
      }
    });

    return NextResponse.json({
      success: true,
      savedSearch,
      grants
    });
  } catch (err: any) {
    console.error("SAVED SEARCH ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
