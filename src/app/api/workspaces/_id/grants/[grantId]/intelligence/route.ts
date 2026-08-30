import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      documentId: string;
    };
  }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      workspaceId: params.id,
      documentId: params.documentId,
      query: Object.fromEntries(
        url.searchParams.entries()
      ),
      file: "placeholder",
    });
  } catch (err: any) {
    console.error(
      "WORKSPACE DOCUMENT FILE ERROR:",
      err
    );

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}