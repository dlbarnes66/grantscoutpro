import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  // TypeScript thinks params is a Promise, so we match that
  const { invoiceId } = await context.params;

  try {
    // Replace with your real PDF logic
    const pdfBuffer = Buffer.from(`PDF for invoice ${invoiceId}`);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoiceId}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
