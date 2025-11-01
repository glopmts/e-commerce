-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "cardPaymentId" TEXT;

-- CreateTable
CREATE TABLE "card_payments" (
    "id" TEXT NOT NULL,
    "cardNumber" VARCHAR(255) NOT NULL,
    "holderName" VARCHAR(255) NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "cvv" VARCHAR(10),
    "brand" VARCHAR(50) NOT NULL,
    "token" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_payments_token_key" ON "card_payments"("token");

-- CreateIndex
CREATE INDEX "card_payments_userId_idx" ON "card_payments"("userId");

-- CreateIndex
CREATE INDEX "card_payments_token_idx" ON "card_payments"("token");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_cardPaymentId_fkey" FOREIGN KEY ("cardPaymentId") REFERENCES "card_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_payments" ADD CONSTRAINT "card_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
