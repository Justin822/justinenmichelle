-- CreateTable
CREATE TABLE "GiftStatus" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalPaidCents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GiftStatus_pkey" PRIMARY KEY ("id")
);
