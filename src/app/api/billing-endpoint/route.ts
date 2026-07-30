import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const hdrs = headers(); // synchronous
  const origin = hdrs.get("origin") ?? "";

  return NextResponse.json({
    message: "Billing endpoint OK",
    origin
  });
}

