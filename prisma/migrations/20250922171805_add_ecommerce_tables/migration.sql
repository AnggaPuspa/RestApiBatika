-- CreateEnum
CREATE TYPE "public"."StatusPembayaranEnum" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'expired');

-- CreateEnum
CREATE TYPE "public"."JenisPengirimanEnum" AS ENUM ('reguler', 'express', 'same_day', 'pickup');

-- CreateEnum
CREATE TYPE "public"."StatusReviewEnum" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."JenisNotifikasiEnum" AS ENUM ('pesanan', 'pembayaran', 'pengiriman', 'review', 'sistem');

-- CreateTable
CREATE TABLE "public"."alamat" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "nama_penerima" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "alamat_lengkap" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kode_pos" TEXT NOT NULL,
    "negara" TEXT NOT NULL DEFAULT 'Indonesia',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "alamat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pembayaran" (
    "id" TEXT NOT NULL,
    "pesanan_id" TEXT NOT NULL,
    "metode_pembayaran" TEXT NOT NULL,
    "provider" TEXT,
    "external_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "public"."StatusPembayaranEnum" NOT NULL DEFAULT 'pending',
    "payment_url" TEXT,
    "expired_at" TIMESTAMPTZ,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pengiriman" (
    "id" TEXT NOT NULL,
    "pesanan_id" TEXT NOT NULL,
    "kurir" TEXT NOT NULL,
    "layanan" TEXT NOT NULL,
    "jenis" "public"."JenisPengirimanEnum" NOT NULL DEFAULT 'reguler',
    "no_resi" TEXT,
    "estimasi_hari" INTEGER,
    "ongkir" DECIMAL(12,2) NOT NULL,
    "berat_total" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shipped_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pengiriman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "pesanan_id" TEXT,
    "rating" INTEGER NOT NULL,
    "judul" TEXT,
    "komentar" TEXT,
    "status" "public"."StatusReviewEnum" NOT NULL DEFAULT 'pending',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."keranjang" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "varian_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "keranjang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifikasi" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "jenis" "public"."JenisNotifikasiEnum" NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "parent_id" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."produk_kategori" (
    "id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produk_kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wishlist" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kupon" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jenis" TEXT NOT NULL,
    "nilai" DECIMAL(12,2) NOT NULL,
    "min_pembelian" DECIMAL(12,2),
    "max_diskon" DECIMAL(12,2),
    "batas_penggunaan" INTEGER,
    "sudah_digunakan" INTEGER NOT NULL DEFAULT 0,
    "berlaku_dari" TIMESTAMPTZ NOT NULL,
    "berlaku_sampai" TIMESTAMPTZ NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "kupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."penggunaan_kupon" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "kupon_id" TEXT NOT NULL,
    "pesanan_id" TEXT NOT NULL,
    "diskon" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penggunaan_kupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_pengguna_id_produk_id_key" ON "public"."review"("pengguna_id", "produk_id");

-- CreateIndex
CREATE UNIQUE INDEX "keranjang_pengguna_id_varian_id_key" ON "public"."keranjang"("pengguna_id", "varian_id");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_slug_key" ON "public"."kategori"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "produk_kategori_produk_id_kategori_id_key" ON "public"."produk_kategori"("produk_id", "kategori_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_pengguna_id_produk_id_key" ON "public"."wishlist"("pengguna_id", "produk_id");

-- CreateIndex
CREATE UNIQUE INDEX "kupon_kode_key" ON "public"."kupon"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "penggunaan_kupon_pengguna_id_kupon_id_pesanan_id_key" ON "public"."penggunaan_kupon"("pengguna_id", "kupon_id", "pesanan_id");

-- AddForeignKey
ALTER TABLE "public"."alamat" ADD CONSTRAINT "alamat_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pembayaran" ADD CONSTRAINT "pembayaran_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pengiriman" ADD CONSTRAINT "pengiriman_pesanan_id_fkey" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keranjang" ADD CONSTRAINT "keranjang_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keranjang" ADD CONSTRAINT "keranjang_varian_id_fkey" FOREIGN KEY ("varian_id") REFERENCES "public"."varian_produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifikasi" ADD CONSTRAINT "notifikasi_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kategori" ADD CONSTRAINT "kategori_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produk_kategori" ADD CONSTRAINT "produk_kategori_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."produk_kategori" ADD CONSTRAINT "produk_kategori_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist" ADD CONSTRAINT "wishlist_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist" ADD CONSTRAINT "wishlist_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "public"."produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."penggunaan_kupon" ADD CONSTRAINT "penggunaan_kupon_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."penggunaan_kupon" ADD CONSTRAINT "penggunaan_kupon_kupon_id_fkey" FOREIGN KEY ("kupon_id") REFERENCES "public"."kupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
