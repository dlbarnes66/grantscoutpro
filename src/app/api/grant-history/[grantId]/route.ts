import { NextResponse } from "next/server";
import { loadHistory } from "@/app/dashboard/lib/loadHistory";

export async function GET(
  req: Request,
  context: { params: Promise<{ grantId: string }> }
) {
  const { grantId } = await context.params;

  const history = await loadHistory(grantId);

  return NextResponse.json(history);
}
