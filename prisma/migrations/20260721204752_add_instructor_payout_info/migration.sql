-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('MOBILE_WALLET', 'BANK_CARD');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "payoutMethod" "PayoutMethod",
ADD COLUMN     "payoutNumberEncrypted" TEXT,
ADD COLUMN     "payoutNumberLast4" TEXT;
