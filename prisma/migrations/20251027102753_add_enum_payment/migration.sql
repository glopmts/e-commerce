-- CreateEnum
CREATE TYPE "PaymentMethodEnum" AS ENUM ('PIX', 'CARD', 'TICKET');

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "typePayment" "PaymentMethodEnum" NOT NULL DEFAULT 'PIX';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "productId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
