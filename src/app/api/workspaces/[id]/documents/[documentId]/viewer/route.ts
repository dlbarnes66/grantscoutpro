import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
      documentId: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;

    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      workspaceId: params.id,
      documentId: params.documentId,
      content: "",
      query: Object.fromEntries(
        url.searchParams.entries()
      ),
    });
  } catch (error) {
    console.error(
      "WORKSPACE DOCUMENT VIEWER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
``