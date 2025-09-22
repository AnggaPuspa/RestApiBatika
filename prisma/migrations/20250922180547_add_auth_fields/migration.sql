/*
  Warnings:

  - A unique constraint covering the columns `[supabase_id]` on the table `pengguna` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."pengguna" ADD COLUMN     "foto_profil" TEXT,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jenis_kelamin" TEXT,
ADD COLUMN     "last_login" TIMESTAMPTZ,
ADD COLUMN     "supabase_id" TEXT,
ADD COLUMN     "tanggal_lahir" DATE;

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_supabase_id_key" ON "public"."pengguna"("supabase_id");
