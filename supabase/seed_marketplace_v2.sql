-- ==============================================================================
-- SEED MARKETPLACE V2
-- This script wipes out the old demo products (and any dependent data)
-- and seeds the new 6 real-world products as requested.
-- ==============================================================================

-- 1. Delete dependent data first to satisfy foreign key constraints
DELETE FROM public.green_credits_log;
DELETE FROM public.orders;
DELETE FROM public.returns;

-- 2. Delete existing products
DELETE FROM public.products;

-- 3. Reset platform stats to keep everything clean
UPDATE public.platform_stats 
SET 
    total_returns_processed = 0,
    total_co2_saved_kg = 0,
    total_money_saved_inr = 0,
    total_items_diverted = 0,
    last_updated = now()
WHERE id = 1;

-- 4. Insert the 6 new products
-- Using the mock seller ID '00000000-0000-0000-0000-000000000001'
INSERT INTO public.products (
  seller_id, 
  title, 
  description, 
  original_price, 
  current_price, 
  category, 
  image_url, 
  condition, 
  return_risk_score, 
  is_refurbished, 
  relist_status
) VALUES 
('00000000-0000-0000-0000-000000000001', 'Sparx Mens Flip Flop 7 UK', 'Comfortable, durable and stylish everyday flip flops by Sparx.', 499.00, 499.00, 'Footwear', 'https://m.media-amazon.com/images/I/61dgP8XDIoL._SY695_.jpg', 'new', 10, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Puma Unisex Adult Max Slide', 'Sleek design and premium comfort for your casual wear.', 1499.00, 1499.00, 'Footwear', 'https://m.media-amazon.com/images/I/51utcv6JMNL._SY695_.jpg', 'new', 12, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Apple iPhone 16e 128GB', 'The latest iPhone 16e features an advanced camera system, incredible battery life, and powerful performance.', 65900.00, 65900.00, 'Electronics', 'https://m.media-amazon.com/images/I/31YrZL046rL._SX342_SY445_QL70_FMwebp_.jpg', 'new', 15, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Apple iPad 11" A16 Chip', 'Powerful and versatile. The new iPad 11-inch with the A16 Bionic chip handles everything with ease.', 39900.00, 39900.00, 'Electronics', 'https://m.media-amazon.com/images/I/41vE9cIx29L._SY300_SX300_QL70_FMwebp_.jpg', 'new', 10, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Apple MacBook Air M2', 'Supercharged by M2. Features a strikingly thin design, brilliant Liquid Retina display, and incredible performance.', 89900.00, 89900.00, 'Electronics', 'https://m.media-amazon.com/images/I/61dLund7bhL._SX679_.jpg', 'new', 8, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Nike Mens Downshifter 14 Running Shoes', 'Reliable and comfortable running shoes that provide excellent support for your daily miles.', 3495.00, 3495.00, 'Footwear', 'https://m.media-amazon.com/images/I/61U2wikE1gL._AC_SX679_.jpg', 'new', 18, FALSE, 'active');
