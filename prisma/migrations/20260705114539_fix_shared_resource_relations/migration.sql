-- CreateTable
CREATE TABLE "SharedResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "ownerOrgId" TEXT NOT NULL,
    "sharedWithId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedResource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SharedResource" ADD CONSTRAINT "SharedResource_ownerOrgId_fkey" FOREIGN KEY ("ownerOrgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedResource" ADD CONSTRAINT "SharedResource_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;
