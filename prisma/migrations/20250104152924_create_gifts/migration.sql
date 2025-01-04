/*
  Warnings:

  - You are about to drop the `GiftStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "GiftStatus";

-- CreateTable
CREATE TABLE "Gift" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maxCents" INTEGER NOT NULL,
    "totalPaidCents" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);
