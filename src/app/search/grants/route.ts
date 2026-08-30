import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vectorSearch } from "@/lib/search/vectorSearch";
import { keywordSearch } from "@/lib/search/keywordSearch";

export async function GET(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const mode = searchParams.get("mode") || "hybrid"; // "vector" | "keyword" | "hybrid"
  const category = searchParams.get("category") || null;
  const agency = searchParams.get("agency") || null;
  const status = searchParams.get("status") || null;
  const minAmount = searchParams.get("minAmount");
  const maxAmount = searchParams.get("maxAmount");
  const deadlineBefore = searchParams.get("deadlineBefore");
  const deadlineAfter = searchParams.get("deadlineAfter");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  // 1) Base filter
  const where: any = {};

  if (category) where.category = category;
  if (agency) where.agency = agency;
  if (status) where.status = status;
  if (minAmount) where.amount = { gte: Number(minAmount) };
  if (maxAmount) where.amount = { ...(where.amount || {}), lte: Number(maxAmount) };
  if (deadlineBefore) where.deadline = { lte: new Date(deadlineBefore) };
  if (deadlineAfter) where.deadline = { ...(where.deadline || {}), gte: new Date(deadlineAfter) };

  // 2) Keyword results
  let keywordResults: any[] = [];
  if (q && (mode === "keyword" || mode === "hybrid")) {
    keywordResults = await keywordSearch(q, where);
  }

  // 3) Vector results
  let vectorResults: any[] = [];
  if (q && (mode === "vector" || mode === "hybrid")) {
    vectorResults = await vectorSearch(q, where);
  }

  // 4) Hybrid merge
  let merged: any[] = [];

  if (mode === "keyword") {
    merged = keywordResults;
  } else if (mode === "vector") {
    merged = vectorResults;
  } else {
    const byId: Record<string, any> = {};

    for (const r of keywordResults) {
      byId[r.id] = { ...r, score: (byId[r.id]?.score || 0) + 1.0 };
    }

    for (const r of vectorResults) {
      byId[r.id] = { ...r, score: (byId[r.id]?.score || 0) + r.score };
    }

    merged = Object.values(byId).sort(
      (a: any, b: any) => (b.score || 0) - (a.score || 0)
    );
  }

  // 5) Pagination
  const total = merged.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = merged.slice(start, end);

  return NextResponse.json({
    results: pageItems,
    total,
    page,
    pageSize,
  });
}
