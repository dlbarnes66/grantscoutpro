/**
 * K-means clustering engine for document embeddings.
 *
 * Used for:
 * - Workspace-wide topic clustering
 * - Grant theme grouping
 * - Narrative clustering
 * - AI workspace intelligence
 *
 * Input:
 * - vectors: number[][]
 * - k: number (cluster count)
 *
 * Output:
 * {
 *   clusters: number[][][]   // vectors grouped by cluster
 *   assignments: number[]    // cluster index per vector
 *   centroids: number[][]    // final centroid vectors
 * }
 */

import { cosineSimilarity } from "./similarity";

/**
 * Picks k random vectors as initial centroids.
 */
function initializeCentroids(vectors: number[][], k: number): number[][] {
  const shuffled = [...vectors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, k);
}

/**
 * Assigns each vector to the nearest centroid.
 */
function assignClusters(
  vectors: number[][],
  centroids: number[][]
): number[] {
  return vectors.map((vector) => {
    let bestIndex = 0;
    let bestScore = -Infinity;

    centroids.forEach((centroid, idx) => {
      const score = cosineSimilarity(vector, centroid);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    });

    return bestIndex;
  });
}

/**
 * Recomputes centroids by averaging vectors in each cluster.
 */
function recomputeCentroids(
  vectors: number[][],
  assignments: number[],
  k: number
): number[][] {
  const clusters: number[][][] = Array.from({ length: k }, () => []);

  vectors.forEach((vector, idx) => {
    clusters[assignments[idx]].push(vector);
  });

  return clusters.map((cluster) => {
    if (cluster.length === 0) {
      // Empty cluster — return zero vector
      return new Array(vectors[0].length).fill(0);
    }

    const centroid = new Array(vectors[0].length).fill(0);

    cluster.forEach((vector) => {
      vector.forEach((value, i) => {
        centroid[i] += value;
      });
    });

    return centroid.map((v) => v / cluster.length);
  });
}

/**
 * Main K-means clustering function.
 */
export function kmeans(vectors: number[][], k: number): {
  clusters: number[][][];
  assignments: number[];
  centroids: number[][];
} {
  if (!vectors || vectors.length === 0) {
    throw new Error("Clustering error: no vectors provided");
  }

  if (k <= 0) {
    throw new Error("Clustering error: k must be > 0");
  }

  // 1. Initialize centroids
  let centroids = initializeCentroids(vectors, k);

  let assignments: number[] = [];
  let iterations = 0;

  while (iterations < 20) {
    iterations++;

    // 2. Assign vectors to nearest centroid
    assignments = assignClusters(vectors, centroids);

    // 3. Recompute centroids
    const newCentroids = recomputeCentroids(vectors, assignments, k);

    // 4. Check for convergence
    const converged = centroids.every((centroid, idx) => {
      const newCentroid = newCentroids[idx];
      const score = cosineSimilarity(centroid, newCentroid);
      return score > 0.999; // nearly identical
    });

    centroids = newCentroids;

    if (converged) break;
  }

  // Build final cluster groups
  const clusters: number[][][] = Array.from({ length: k }, () => []);
  vectors.forEach((vector, idx) => {
    clusters[assignments[idx]].push(vector);
  });

  return {
    clusters,
    assignments,
    centroids,
  };
}
