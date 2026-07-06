-- CreateTable
CREATE TABLE "GrantSection" (
    "id" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "GrantSection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GrantSection" ADD CONSTRAINT "GrantSection_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
