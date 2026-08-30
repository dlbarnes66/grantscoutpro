import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
const {
  originalText = "",
  improvedText = "",
  changesMade = [],
  reasons = [],
  grant = {},
  worker = "",
} = body;
if (!originalText || !improvedText) {
  return NextResponse.json(
    { error: "Missing original or improved text" },
    { status: 400 }
  );
}
const historyRecord = {
  userId,
  worker,
  timestamp: Date.now(),
  grantId: grant.id || null,
  originalText,
  improvedText,
  changesMade,
  reasons,
};
const saved = true; // Replace with database insert
return NextResponse.json({
  success: true,
  saved: true,
  history: historyRecord,
});
}
