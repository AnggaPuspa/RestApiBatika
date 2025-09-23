/*
  Warnings:

  - The values [confirmed,processing,returned] on the enum `StatusPesananEnum` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending] on the enum `StatusReviewEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `rating_jumlah` on the `penjual` table. All the data in the column will be lost.
  - You are about to drop the column `rating_rata` on the `penjual` table. All the data in the column will be lost.
  - The `verification_level` column on the `penjual` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `delivered_at` on the `pesanan` table. All the data in the column will be lost.
  - You are about to drop the column `kurir` on the `pesanan` table. All the data in the column will be lost.
  - You are about to drop the column `layanan` on the `pesanan` table. All the data in the column will be lost.
  - You are about to drop the column `no_resi` on the `pesanan` table. All the data in the column will be lost.
  - You are about to drop the column `shipped_at` on the `pesanan` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."VerificationLevelEnum" AS ENUM ('bronze', 'silver', 'gold');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatusPesananEnum_new" AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
ALTER TABLE "public"."pesanan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."pesanan" ALTER COLUMN "status" TYPE "public"."StatusPesananEnum_new" USING ("status"::text::"public"."StatusPesananEnum_new");
ALTER TYPE "public"."StatusPesananEnum" RENAME TO "StatusPesananEnum_old";
ALTER TYPE "public"."StatusPesananEnum_new" RENAME TO "StatusPesananEnum";
DROP TYPE "public"."StatusPesananEnum_old";
ALTER TABLE "public"."pesanan" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatusReviewEnum_new" AS ENUM ('approved', 'rejected');
ALTER TABLE "public"."review" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."review" ALTER COLUMN "status" TYPE "public"."StatusReviewEnum_new" USING ("status"::text::"public"."StatusReviewEnum_new");
ALTER TYPE "public"."StatusReviewEnum" RENAME TO "StatusReviewEnum_old";
ALTER TYPE "public"."StatusReviewEnum_new" RENAME TO "StatusReviewEnum";
DROP TYPE "public"."StatusReviewEnum_old";
ALTER TABLE "public"."review" ALTER COLUMN "status" SET DEFAULT 'approved';
COMMIT;

-- AlterTable
ALTER TABLE "public"."penjual" DROP COLUMN "rating_jumlah",
DROP COLUMN "rating_rata",
DROP COLUMN "verification_level",
ADD COLUMN     "verification_level" "public"."VerificationLevelEnum";

-- AlterTable
ALTER TABLE "public"."pesanan" DROP COLUMN "delivered_at",
DROP COLUMN "kurir",
DROP COLUMN "layanan",
DROP COLUMN "no_resi",
DROP COLUMN "shipped_at";

-- AlterTable
ALTER TABLE "public"."review" ALTER COLUMN "status" SET DEFAULT 'approved';

-- CreateTable
CREATE TABLE "public"."conversation" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "product_id" TEXT,
    "last_message_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_buyer_id_seller_id_product_id_key" ON "public"."conversation"("buyer_id", "seller_id", "product_id");

-- AddForeignKey
ALTER TABLE "public"."conversation" ADD CONSTRAINT "conversation_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation" ADD CONSTRAINT "conversation_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation" ADD CONSTRAINT "conversation_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;
