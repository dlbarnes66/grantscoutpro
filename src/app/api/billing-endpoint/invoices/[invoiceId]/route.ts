import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "GET",
      invoiceId: params.invoiceId,
      query: Object.fromEntries(url.searchParams.entries())
    });
  } catch (err: any) {
    console.error("GET INVOICE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      method: "POST",
      invoiceId: params.invoiceId,
      query: Object.fromEntries(url.searchParams.entries()),
      body
    });
  } catch (err: any) {
    console.error("POST INVOICE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
