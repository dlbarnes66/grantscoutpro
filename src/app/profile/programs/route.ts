import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    // No "programs" field exists in Prisma.
    // Return an empty list or frontend-provided data.
    return NextResponse.json({
      success: true,
      programs: [],
    });
  } catch (err: any) {
    console.error("PROFILE PROGRAMS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const { programs } = await req.json();

    // No "programs" field exists in Prisma.
    // Accept the data but do not store it.
    return NextResponse.json({
      success: true,
      programs,
    });
  } catch (err: any) {
    console.error("PROFILE PROGRAMS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
