import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const start = Date.now();

    // --- DATABASE LATENCY TEST ---
    let dbLatency = null;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (err) {
      dbLatency = -1;
    }

    // --- AI LATENCY TEST (mock ping) ---
    let aiLatency = null;
    try {
      const aiStart = Date.now();
      // Replace with real AI ping if needed
      aiLatency = Date.now() - aiStart;
    } catch (err) {
      aiLatency = -1;
    }

    // --- EMBEDDING LATENCY TEST (mock ping) ---
    let embeddingLatency = null;
    try {
      const embedStart = Date.now();
      // Replace with real embedding ping if needed
      embeddingLatency = Date.now() - embedStart;
    } catch (err) {
      embeddingLatency = -1;
    }

    // --- TABLE COUNTS ---
    const [
      userCount,
      workspaceCount,
      documentCount,
      activityCount,
      commentCount,
      shareCount,
      billingCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.workspaceDocument.count(),
      prisma.workspaceDocumentActivity.count(),
      prisma.documentComment.count(),
      prisma.documentShare.count(),
      prisma.workspaceBilling.count()
    ]);

    // --- QUEUE/WORKER STATUS (stubbed) ---
    const queueStatus = {
      emailQueue: "ok",
      aiQueue: "ok",
      indexingQueue: "ok"
    };

    // --- TOTAL LATENCY ---
    const totalLatency = Date.now() - start;

    return NextResponse.json(
      {
        status: "ok",
        diagnostics: {
          latency: {
            totalMs: totalLatency,
            databaseMs: dbLatency,
            aiMs: aiLatency,
            embeddingMs: embeddingLatency
          },
          counts: {
            users: userCount,
            workspaces: workspaceCount,
            documents: documentCount,
            activities: activityCount,
            comments: commentCount,
            shares: shareCount,
            billingRecords: billingCount
          },
          queues: queueStatus,
          system: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development"
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("System Diagnostics error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "System diagnostics failed."
      },
      { status: 500 }
    );
  }
}
