/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "messengerName" TEXT;
