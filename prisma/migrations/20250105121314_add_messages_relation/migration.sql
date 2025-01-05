-- CreateTable
CREATE TABLE "GiftMessage" (
    "id" SERIAL NOT NULL,
    "giftId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GiftMessage" ADD CONSTRAINT "GiftMessage_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
