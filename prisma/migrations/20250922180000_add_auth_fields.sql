-- Add auth fields to pengguna table
ALTER TABLE "pengguna" 
ADD COLUMN "supabase_id" TEXT UNIQUE,
ADD COLUMN "foto_profil" TEXT,
ADD COLUMN "tanggal_lahir" DATE,
ADD COLUMN "jenis_kelamin" TEXT,
ADD COLUMN "is_verified" BOOLEAN DEFAULT false,
ADD COLUMN "last_login" TIMESTAMPTZ;

-- Create index for supabase_id for faster lookups
CREATE INDEX "pengguna_supabase_id_idx" ON "pengguna"("supabase_id");

-- Add comments to explain the architecture
COMMENT ON COLUMN "pengguna"."supabase_id" IS 'ID from Supabase Auth for authentication';
COMMENT ON COLUMN "pengguna"."email" IS 'Email from Supabase Auth (kept for business logic)';
COMMENT ON COLUMN "pengguna"."is_verified" IS 'Email verification status from Supabase';
COMMENT ON COLUMN "pengguna"."foto_profil" IS 'Profile photo URL from Supabase Auth';
COMMENT ON COLUMN "pengguna"."last_login" IS 'Last login timestamp for analytics';
