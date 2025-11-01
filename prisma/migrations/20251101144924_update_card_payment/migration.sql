/*
  Warnings:

  - You are about to alter the column `cardNumber` on the `card_payments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(16)`.
  - You are about to alter the column `cvv` on the `card_payments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `VarChar(4)`.

*/
-- AlterTable
ALTER TABLE "card_payments" ALTER COLUMN "cardNumber" SET DATA TYPE VARCHAR(16),
ALTER COLUMN "cvv" SET DATA TYPE VARCHAR(4);
