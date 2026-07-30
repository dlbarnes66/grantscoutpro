export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



// ─────────────────────────────────────────────
// SAFE SELF-CONTAINED K-MEANS IMPLEMENTATION
// ─────────────────────────────────────────────

function euclidean(a: number[], b: number[]) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

function kmeans(vectors: number[][], k: number) {
  // Randomly initialize centroids
  let centroids = vectors.slice(0, k).map((v) => [...v]);

  let assignments = new Array(vectors.length).fill(0);

  for (let iter = 0; iter < 10; iter++) {
    // Assign points to nearest centroid
    for (let i = 0; i < vectors.length; i++) {
      let best = 0;
      let bestDist = Infinity;

      for (let c = 0; c < k; c++) {
        const dist = euclidean(vectors[i], centroids[c]);
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }

      assignments[i] = best;
    }

    // Recompute centroids
    const newCentroids = Array.from({ length: k }, () =>
      new Array(vectors[0].length).fill(0)
    );
    const counts = new Array(k).fill(0);

    for (let i = 0; i < vectors.length; i++) {
      const cluster = assignments[i];
      counts[cluster]++;
      for (let j = 0; j < vectors[i].length; j++) {
        newCentroids[cluster][j] += vectors[i][j];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) continue;
      for (let j = 0; j < newCentroids[c].length; j++) {
        newCentroids[c][j] /= counts[c];
      }
    }

    centroids = newCentroids;
  }

  // Group assignments
  const clusters: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < assignments.length; i++) {
    clusters[assignments[i]].push(i);
  }

  return { clusters, assignments, centroids };
}

// ─────────────────────────────────────────────
// CLUSTERING ROUTE
// ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { workspaceId, k } = await req.json();

    if (!workspaceId || !k) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or k" },
        { status: 400 }
      );
    }

    // Fetch documents with embeddings
    const docs = await prisma.document.findMany({
      where: {
        workspaceId,
        embedding: { isEmpty: false }, // ✔ FIXED: Float[] filter
      },
      select: {
        id: true,
        title: true,
        embedding: true, // ✔ Correct field from Prisma schema
      },
    });

    if (!docs || docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "No documents with embeddings found" },
        { status: 404 }
      );
    }

    // Extract vectors
    const vectors = docs.map((d) => d.embedding);

    // Run k-means
    const { clusters, assignments, centroids } = kmeans(vectors, k);

    // Save cluster assignments
    const createdClusters = [];

    for (let i = 0; i < clusters.length; i++) {
      const cluster = await prisma.cluster.create({
        data: {
          name: `Cluster ${i + 1}`,
        },
      });

      createdClusters.push(cluster);

      for (const docIndex of clusters[i]) {
        await prisma.clusterAssignment.create({
          data: {
            clusterId: cluster.id,
            grantId: docs[docIndex].id, // ✔ Using document.id
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      clusters: createdClusters,
      assignments,
      centroids,
    });
  } catch (err: any) {
    console.error("CLUSTERING ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
