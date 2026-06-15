-- ==============================================================================
-- RESET DATA SCRIPT
-- This script will wipe out all application data to provide a clean slate,
-- but will retain the schema and the mock users required for the frontend
-- mock-authentication to function.
-- ==============================================================================

-- 1. Delete all green credit logs
DELETE FROM public.green_credits_log;

-- 2. Delete all orders
DELETE FROM public.orders;

-- 3. Delete all returns
DELETE FROM public.returns;

-- 4. Delete all products
-- Note: because of parent_product_id foreign key, we delete all at once.
DELETE FROM public.products;

-- 5. Reset platform_stats instead of deleting
UPDATE public.platform_stats 
SET 
    total_returns_processed = 0,
    total_co2_saved_kg = 0,
    total_money_saved_inr = 0,
    total_items_diverted = 0,
    last_updated = now()
WHERE id = 1;

-- Note: We DO NOT delete from `public.users` because the frontend MVP relies 
-- on the hardcoded buyer ('00000000-0000-0000-0000-000000000002') and 
-- seller ('00000000-0000-0000-0000-000000000001') to function.
