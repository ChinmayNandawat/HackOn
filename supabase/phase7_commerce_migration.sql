-- Phase 7: Real Commerce & Orders system
-- This migration adds the missing products schema definitions and creates a real orders table.

-- 1. Alter products table to match frontend logic
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_refurbished BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_product_id UUID REFERENCES products(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS relist_status TEXT DEFAULT 'active' CHECK (relist_status IN ('active', 'sold'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS health_data JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_resale_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS relisted_at TIMESTAMP WITH TIME ZONE;

-- Initialize is_refurbished based on condition for existing data
UPDATE products SET is_refurbished = TRUE WHERE condition = 'refurbished';

-- 2. Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In a production system we'd add RLS policies here for the orders table.
-- For the HackOn MVP, we rely on the anon key defaults.

-- 3. Add Better Demo Data (Real Amazon Images & Products)
INSERT INTO products (seller_id, title, description, original_price, current_price, category, image_url, condition, return_risk_score, is_refurbished, relist_status) 
VALUES 
('00000000-0000-0000-0000-000000000001', 'Apple MacBook Air M3 (13-inch, 8GB RAM, 256GB Storage) - Midnight', 'Supercharged by M3, the MacBook Air features incredibly fast Wi-Fi 6E, up to 18 hours of battery life, and a brilliant Liquid Retina display.', 114900.00, 114900.00, 'Electronics', 'https://m.media-amazon.com/images/I/71jG+e7roXL._SX679_.jpg', 'new', 20, FALSE, 'active'),
('00000000-0000-0000-0000-000000000001', 'Sony PlayStation 5 Console', 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.', 49990.00, 49990.00, 'Electronics', 'https://m.media-amazon.com/images/I/51qB1XqgJqL._SX522_.jpg', 'new', 12, FALSE, 'active'),
('00000000-0000-0000-0000-000000000001', 'Nike Air Force 1 ''07 Men''s Sneakers', 'The radiance lives on in the Nike Air Force 1 ''07, the b-ball icon that puts a fresh spin on what you know best.', 7495.00, 7495.00, 'Shoes', 'https://m.media-amazon.com/images/I/51d1lWw3vIL._SY695_.jpg', 'new', 65, FALSE, 'active'),
('00000000-0000-0000-0000-000000000001', 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB, 256GB)', 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8" flat display.', 129999.00, 129999.00, 'Electronics', 'https://m.media-amazon.com/images/I/71CXhVhpM0L._SX679_.jpg', 'new', 18, FALSE, 'active');
