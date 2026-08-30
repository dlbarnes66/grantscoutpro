import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      plans: [
        { id: "basic", name: "Basic", seats: 1 },
        { id: "team", name: "Team", seats: 5 },
        { id: "business", name: "Business", seats: 20 },
        { id: "enterprise", name: "Enterprise", seats: 50 },
      ],
    });
  } catch (err) {
    console.error("PLAN ROOT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
