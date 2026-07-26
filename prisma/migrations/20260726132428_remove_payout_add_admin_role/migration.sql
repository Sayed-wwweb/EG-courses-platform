/*
  Warnings:

  - You are about to drop the column `paymobOrderId` on the `enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `payoutMethod` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `payoutNumberEncrypted` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `payoutNumberLast4` on the `user` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- DropIndex
DROP INDEX "enrollment_paymobOrderId_key";

-- AlterTable
ALTER TABLE "enrollment" DROP COLUMN "paymobOrderId";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "payoutMethod",
DROP COLUMN "payoutNumberEncrypted",
DROP COLUMN "payoutNumberLast4";

-- DropEnum
DROP TYPE "PayoutMethod";
