-- ========================================================
-- Phase 4 Migration: Refurbished Products Support
-- ========================================================

-- 1. Extend the 'products' table for refurbished listings
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_refurbished boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS parent_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS health_data JSONB,
ADD COLUMN IF NOT EXISTS estimated_resale_price numeric,
ADD COLUMN IF NOT EXISTS relist_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS relisted_at timestamptz;

-- 2. Extend the 'returns' table for AI suggested price
ALTER TABLE returns
ADD COLUMN IF NOT EXISTS ai_suggested_price numeric;

-- 3. Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_products_is_refurbished ON products(is_refurbished);
CREATE INDEX IF NOT EXISTS idx_products_parent_product_id ON products(parent_product_id);

-- 4. Enable Row Level Security (RLS) on products table (if not already enabled)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS Policies for Refurbished Products
-- Drop existing policies if they exist to make the script completely idempotent
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view refurbished products" ON products;
    DROP POLICY IF EXISTS "Authenticated users can insert refurbished products" ON products;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Policy: Allow public read access to refurbished products so buyers can see them without authentication
CREATE POLICY "Public can view refurbished products" 
ON products 
FOR SELECT 
USING (is_refurbished = true);

-- Policy: Allow authenticated users to insert into products for the relist flow
CREATE POLICY "Authenticated users can insert refurbished products" 
ON products 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
