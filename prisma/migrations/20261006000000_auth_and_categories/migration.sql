-- Users / login (ADMIN + AGENT), product categories, and order -> agent link.
-- Written to be idempotent: safe to run more than once, and safe on a database
-- that was created with `prisma db push` instead of `prisma migrate`.

-- Role enum
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");

-- Default product types
INSERT INTO "Category" ("id", "name", "updatedAt") VALUES
  ('cat_plastic', 'Plastic', CURRENT_TIMESTAMP),
  ('cat_styro',   'Styro',   CURRENT_TIMESTAMP),
  ('cat_paper',   'Paper',   CURRENT_TIMESTAMP),
  ('cat_others',  'Others',  CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Product.categoryId
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");

-- Move the old free-text Product.category into Category rows, then drop it.
-- "General" was the app default, so it is treated as uncategorized.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'category'
  ) THEN
    INSERT INTO "Category" ("id", "name", "updatedAt")
    SELECT 'cat_' || md5(lower(trim("category"))), initcap(trim("category")), CURRENT_TIMESTAMP
    FROM "Product"
    WHERE "category" IS NOT NULL
      AND trim("category") <> ''
      AND lower(trim("category")) <> 'general'
    GROUP BY lower(trim("category")), initcap(trim("category"))
    ON CONFLICT ("name") DO NOTHING;

    UPDATE "Product" p
    SET "categoryId" = c."id"
    FROM "Category" c
    WHERE p."categoryId" IS NULL
      AND lower(c."name") = lower(trim(p."category"));

    ALTER TABLE "Product" DROP COLUMN "category";
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Order.agentId (who booked it)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "agentId" TEXT;
CREATE INDEX IF NOT EXISTS "Order_agentId_idx" ON "Order"("agentId");

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_agentId_fkey"
    FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
