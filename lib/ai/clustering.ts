/**
 * K-means clustering engine for document embeddings.
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
export function kmeans(
  vectors: number[][],
  k: number
): {
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

  let centroids = initializeCentroids(vectors, k);

  let assignments: number[] = [];
  let iterations = 0;

  while (iterations < 20) {
    iterations++;

    assignments = assignClusters(vectors, centroids);

    const newCentroids = recomputeCentroids(vectors, assignments, k);

    const converged = centroids.every((centroid, idx) => {
      const newCentroid = newCentroids[idx];
      const score = cosineSimilarity(centroid, newCentroid);
      return score > 0.999;
    });

    centroids = newCentroids;

    if (converged) break;
  }

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
