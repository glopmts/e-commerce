-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "discountApplied" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "isPixDiscount" BOOLEAN DEFAULT false;
