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
('00000000-0000-0000-0000-000000000001', 'Portronics Mport One USB C Hub Dock', 'Multi-port USB C hub for all your connectivity needs.', 1299.00, 1299.00, 'Electronics', 'https://m.media-amazon.com/images/I/41N7a-z09fL.jpg', 'new', 5, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Samsung 22" (54.6 cm) S3 Flat Monitor', 'Crisp, clear visuals with Samsung S3 Flat Monitor.', 6500.00, 6500.00, 'Electronics', 'https://m.media-amazon.com/images/I/71JwKnROg8L._SX679_.jpg', 'new', 8, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'DIGIROOT iPad Pencil', 'High-precision stylus pen for iPad.', 1999.00, 1999.00, 'Electronics', 'https://m.media-amazon.com/images/I/51UBr3cmxOL._SX679_.jpg', 'new', 5, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Original Air Conditioner Remote Control', 'Universal replacement remote control for Air Conditioners.', 500.00, 500.00, 'Electronics', 'https://m.media-amazon.com/images/I/51UBr3cmxOL._SX679_.jpg', 'new', 2, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Zebronics Zeb-Crystal Clear Web Camera', 'Crystal clear video calls with Zebronics Web Camera.', 899.00, 899.00, 'Electronics', 'https://m.media-amazon.com/images/I/71qnZFqFM9L._SX679_.jpg', 'new', 4, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Boat Nirvana Ion ANC Pro, Hi-Res Audio', 'Immersive audio experience with Active Noise Cancellation.', 2999.00, 2999.00, 'Electronics', 'https://m.media-amazon.com/images/I/71plvQVaULL._SX679_.jpg', 'new', 6, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Richy Toys White Dog Cute Plush', 'Adorable white dog plush toy, incredibly soft.', 499.00, 499.00, 'Home', 'https://m.media-amazon.com/images/I/71jJv5eE7XL._SX679_.jpg', 'new', 2, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Samsung Original 25W USB Type-C Travel Adaptor', 'Super fast charging 25W adapter by Samsung.', 1199.00, 1199.00, 'Electronics', 'https://m.media-amazon.com/images/I/512UVkoMMEL._SX679_.jpg', 'new', 3, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Tribit XFree Go', 'High fidelity wireless headphones with exceptional battery life.', 2599.00, 2599.00, 'Electronics', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcThD-DFFUevDTgQPtgmmcQ7uRBCCk4Hj8qolh2zlNew3FaauBIg2H_wX5arSUOpeFLy9dhG4VkjxBR3oWi9jNUFA0cl99Ukg-jPN4yCmym_', 'new', 5, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'EvoFox Elite X Gaming Controller for PC', 'Precision gaming controller with ergonomic design.', 1499.00, 1499.00, 'Electronics', 'https://m.media-amazon.com/images/I/41zsXOJslQL._SX342_SY445_QL70_FMwebp_.jpg', 'new', 6, FALSE, 'active'),

('00000000-0000-0000-0000-000000000001', 'Nothing Phone (2a) (White, 128 GB)', 'Innovative transparent design with powerful performance.', 23999.00, 23999.00, 'Electronics', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyUayGmK0LkHzsw9fFdk9VnYPj2DNpX2K64WGf149Wxg&s=10', 'new', 12, FALSE, 'active');
