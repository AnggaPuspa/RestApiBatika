-- CreateEnum
CREATE TYPE "public"."StatusPesananEnum" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');

-- CreateTable
CREATE TABLE "public"."pengguna" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telepon" TEXT,
    "nama_lengkap" TEXT,
    "adalah_penjual" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."penjual" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "nama_toko" TEXT,
    "slug_toko" TEXT,
    "origin_region" TEXT,
    "badges" JSONB,
    "verified_at" TIMESTAMPTZ,
    "verification_level" TEXT,
    "verification_docs" JSONB,
    "default_currency" TEXT,
    "rating_rata" DECIMAL(65,30),
    "rating_jumlah" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "penjual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."produk" (
    "id" TEXT NOT NULL,
    "penjual_id" TEXT NOT NULL,
    "kode_sku" TEXT,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "cerita_budaya" TEXT,
    "panduan_perawatan" TEXT,
    "asal_wilayah" TEXT,
    "attributes" JSONB,
    "motif" TEXT[],
    "bahan" TEXT[],
    "primary_image_url" TEXT,
    "images" JSONB,
    "hs_code" TEXT,
    "made_in_country_code" TEXT,
    "seo_slug" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."produk_i18n" (
    "id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "lang_code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "cerita_budaya" TEXT,
    "panduan_perawatan" TEXT,

    CONSTRAINT "produk_i18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."varian_produk" (
    "id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "nama_varian" TEXT,
    "sku" TEXT,
    "harga" DECIMAL(12,2) NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "berat_gram" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "varian_produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pesanan" (
    "id" TEXT NOT NULL,
    "pembeli_id" TEXT NOT NULL,
    "penjual_id" TEXT NOT NULL,
    "mata_uang" TEXT,
    "subtotal" DECIMAL(12,2),
    "ongkir" DECIMAL(12,2),
    "total" DECIMAL(12,2),
    "status" "public"."StatusPesananEnum" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ship_nama_penerima" TEXT,
    "ship_telepon" TEXT,
    "ship_alamat1" TEXT,
    "ship_alamat2" TEXT,
    "ship_kota" TEXT,
    "ship_wilayah" TEXT,
    "ship_kode_pos" TEXT,
    "ship_country_code" TEXT,
    "kurir" TEXT,
    "layanan" TEXT,
    "no_resi" TEXT,
    "shipped_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,

    CONSTRAINT "pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_pesanan" (
    "id" TEXT NOT NULL,
    "pesanan_id" TEXT NOT NULL,
    "varian_id" TEXT,
    "nama_produk_snapshot" TEXT,
    "nama_varian_snapshot" TEXT,
    "qty" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "item_pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pesan" (
    "id" TEXT NOT NULL,
    "pesanan_id" TEXT,
    "produk_id" TEXT,
    "pengirim_id" TEXT NOT NULL,
    "isi" TEXT,
    "lampiran_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "public"."pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "penjual_pengguna_id_key" ON "public"."penjual"("pengguna_id");

-- CreateIndex
CREATE UNIQUE INDEX "penjual_slug_toko_key" ON "public"."penjual"("slug_toko");

-- CreateIndex
CREATE UNIQUE INDEX "produk_kode_sku_key" ON "public"."produk"("kode_sku");

-- CreateIndex
CREATE UNIQUE INDEX "produk_seo_slug_key" ON "public"."produk"("seo_slug");

-- CreateIndex
CREATE UNIQUE INDEX "produk_i18n_produk_id_lang_code_key" ON "public"."produk_i18n"("produk_id", "lang_code");

-- CreateIndex
CREATE UNIQUE INDEX "varian_produk_sku_key" ON "public"."varian_produk"("sku");

-- AddForeignKey
ALTER TABLE "public"."penjual" ADD CONSTRAINT "penjual_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produk" ADD CONSTRAINT "produk_penjual_id_fkey" FOREIGN KEY ("penjual_id") REFERENCES "public"."penjual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produk_i18n" ADD CONSTRAINT "produk_i18n_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."varian_produk" ADD CONSTRAINT "varian_produk_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pesanan" ADD CONSTRAINT "pesanan_pembeli_id_fkey" FOREIGN KEY ("pembeli_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pesanan" ADD CONSTRAINT "pesanan_penjual_id_fkey" FOREIGN KEY ("penjual_id") REFERENCES "public"."penjual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_pesanan" ADD CONSTRAINT "item_pesanan_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_pesanan" ADD CONSTRAINT "item_pesanan_varian_id_fkey" FOREIGN KEY ("varian_id") REFERENCES "public"."varian_produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pesan" ADD CONSTRAINT "pesan_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pesan" ADD CONSTRAINT "pesan_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pesan" ADD CONSTRAINT "pesan_pengirim_id_fkey" FOREIGN KEY ("pengirim_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;
