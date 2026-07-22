/*
  Warnings:

  - The values [BANK_CARD] on the enum `PayoutMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PayoutMethod_new" AS ENUM ('MOBILE_WALLET', 'BANK_ACCOUNT', 'INSTAPAY');
ALTER TABLE "user" ALTER COLUMN "payoutMethod" TYPE "PayoutMethod_new" USING ("payoutMethod"::text::"PayoutMethod_new");
ALTER TYPE "PayoutMethod" RENAME TO "PayoutMethod_old";
ALTER TYPE "PayoutMethod_new" RENAME TO "PayoutMethod";
DROP TYPE "public"."PayoutMethod_old";
COMMIT;
