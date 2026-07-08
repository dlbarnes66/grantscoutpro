import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContext } from "@/lib/ai/context-resolver";
import { kmeans } from "@/lib/ai/clustering";

/**
 * Clusters workspace documents using k-means.
 *
 * Accepts:
 * {
 *   k: number   // number of clusters
 * }
 *
 * Returns:
 * - clusters with document IDs
 * - centroid vectors
 * - assignments
 */

export async function POST(req: Request) {
  try {
    // 1. Resolve workspace + user
    const { workspaceId } = await resolveContext(req);

    const body = await req.json();
    const { k = 5 } = body;

    if (k <= 0) {
      return NextResponse.json(
        { error: "k must be greater than 0" },
        { status: 400 }
      );
    }

    // 2. Fetch all document embeddings in workspace
    const docs = await prisma.documentEmbedding.findMany({
      where: { workspaceId },
      include: {
        document: true,
      },
    });

    if (docs.length === 0) {
      return NextResponse.json({
        clusters: [],
        assignments: [],
        centroids: [],
        count: 0,
      });
    }

    const vectors = docs.map((d) => d.vector);

    // 3. Run k-means clustering
    const { clusters, assignments, centroids } = kmeans(vectors, k);

    // 4. Build cluster output with document IDs
    const clusterOutput = clusters.map((clusterVectors, clusterIndex) => {
      const docIds = clusterVectors.map((vector) => {
        const idx = vectors.indexOf(vector);
        return docs[idx].documentId;
      });

      return {
        cluster: clusterIndex,
        documentIds: docIds,
      };
    });

    return NextResponse.json({
      k,
      count: docs.length,
      clusters: clusterOutput,
      assignments,
      centroids,
    });
  } catch (err: any) {
    console.error("Clustering error:", err);
    return NextResponse.json(
      { error: err.message || "Clustering failed" },
      { status: 500 }
    );
  }
}
