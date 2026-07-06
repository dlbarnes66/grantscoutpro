-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "addons" TEXT[] DEFAULT ARRAY[]::TEXT[];
