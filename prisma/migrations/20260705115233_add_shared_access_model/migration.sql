-- CreateTable
CREATE TABLE "SharedAccess" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "sharedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedAccess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SharedAccess" ADD CONSTRAINT "SharedAccess_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedAccess" ADD CONSTRAINT "SharedAccess_sharedId_fkey" FOREIGN KEY ("sharedId") REFERENCES "SharedResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
