export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";




export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.json({ valid: true, decoded });
    } catch {
      return NextResponse.json({ valid: false });
    }
  } catch (err: any) {
    console.error("Validate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
