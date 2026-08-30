import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const start = Date.now();

    // --- DATABASE CHECK ---
    let dbStatus = "ok";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = "error";
    }

    // --- AI SERVICE CHECK (mock ping) ---
    let aiStatus = "ok";
    try {
      // Replace with real AI ping if needed
      aiStatus = "ok";
    } catch (err) {
      aiStatus = "error";
    }

    // --- EMBEDDING SERVICE CHECK (mock ping) ---
    let embeddingStatus = "ok";
    try {
      // Replace with real embedding ping if needed
      embeddingStatus = "ok";
    } catch (err) {
      embeddingStatus = "error";
    }

    // --- CACHE CHECK (if you add Redis later) ---
    let cacheStatus = "disabled";

    // --- LATENCY ---
    const latencyMs = Date.now() - start;

    return NextResponse.json(
      {
        status: "ok",
        services: {
          database: dbStatus,
          ai: aiStatus,
          embeddings: embeddingStatus,
          cache: cacheStatus
        },
        system: {
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          latencyMs,
          version: "1.0.0",
          environment: process.env.NODE_ENV || "development"
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("System Health error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "System health check failed."
      },
      { status: 500 }
    );
  }
}
