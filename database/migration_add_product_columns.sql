-- Migration: add commonly used product columns (sku, category, features, compatibility)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sku VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS features TEXT NULL,
    ADD COLUMN IF NOT EXISTS compatibility TEXT NULL;

-- Note: Run this migration manually on your MySQL server if columns are missing.
