import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Record<string, string> }
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
      analysisType: "budget-risk",
      params,
      query: Object.fromEntries(
        url.searchParams.entries()
      ),
    });
  } catch (err: any) {
    console.error(
      "BUDGET RISK GET ERROR:",
      err
    );

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(
      () => ({})
    );

    return NextResponse.json({
      success: true,
      analysisType: "budget-risk",
      params,
      body,
    });
  } catch (err: any) {
    console.error(
      "BUDGET RISK POST ERROR:",
      err
    );

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}