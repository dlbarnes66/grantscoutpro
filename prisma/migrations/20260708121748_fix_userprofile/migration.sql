/*
  Warnings:

  - You are about to drop the column `grantIds` on the `GrantComparison` table. All the data in the column will be lost.
  - Added the required column `grants` to the `GrantComparison` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GrantComparison" DROP COLUMN "grantIds",
ADD COLUMN     "grants" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClusterAssignment" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClusterAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClusterHistory" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "action" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClusterHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClusterAssignment" ADD CONSTRAINT "ClusterAssignment_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClusterAssignment" ADD CONSTRAINT "ClusterAssignment_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClusterHistory" ADD CONSTRAINT "ClusterHistory_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
