import { NextResponse } from "next/server";

// Mock data — replace with Stripe usage records later
export async function GET() {
  return NextResponse.json({
    period: {
      start: 1719878400,
      end: 1722470400
    },
    summary: {
      ai_tokens: 120000,
      grant_searches: 48,
      seats: 3,
      cost: 42.75
    },
    items: [
      { category: "AI Tokens", quantity: 120000, cost: 30.0 },
      { category: "Grant Searches", quantity: 48, cost: 12.0 },
      { category: "Seats", quantity: 3, cost: 0.75 }
    ],
    overages: {
      total: 5.0,
      items: [
        { category: "AI Tokens", cost: 3.0 },
        { category: "Grant Searches", cost: 2.0 }
      ]
    }
  });
}
