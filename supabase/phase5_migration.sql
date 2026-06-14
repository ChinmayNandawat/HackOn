-- ==============================================================================
-- PHASE 5 MIGRATION: Return Prevention & Seller Intelligence
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create platform_stats table
-- This table maintains global platform impact statistics.
-- It uses a CHECK constraint to guarantee only a single row (id = 1) ever exists.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_stats (
    id integer PRIMARY KEY DEFAULT 1,
    total_returns_processed integer DEFAULT 0,
    total_co2_saved_kg numeric DEFAULT 0,
    total_money_saved_inr numeric DEFAULT 0,
    total_items_diverted integer DEFAULT 0,
    last_updated timestamptz DEFAULT now(),
    CONSTRAINT platform_stats_single_row CHECK (id = 1)
);

-- Insert the initial row with zeros if it doesn't already exist
INSERT INTO public.platform_stats (
    id, 
    total_returns_processed, 
    total_co2_saved_kg, 
    total_money_saved_inr, 
    total_items_diverted
) 
VALUES (1, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 2. Create green_credits_log table
-- This table logs individual actions that earn green credits and save CO2.
-- Since there is no auth, we use an anonymous session_id.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.green_credits_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    action_type text NOT NULL, -- e.g., 'keep_and_refund', 'buy_refurbished', 'donate', 'return_processed'
    credits_earned integer NOT NULL,
    co2_saved_kg numeric NOT NULL DEFAULT 0,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Create Indexes for green_credits_log
-- These ensure fast lookups for personal stats and fast aggregations for global stats.
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_green_credits_session ON public.green_credits_log(session_id);
CREATE INDEX IF NOT EXISTS idx_green_credits_action ON public.green_credits_log(action_type);


-- ------------------------------------------------------------------------------
-- 4. Create recalculate_platform_stats() function
-- A utility function to manually recalculate platform totals from the returns table 
-- to populate real statistics for the demo.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_platform_stats()
RETURNS void AS $$
DECLARE
    processed_count integer;
    total_resale numeric;
    co2_saved numeric;
    diverted_count integer;
BEGIN
    -- Count total processed returns
    -- Note: Including 'completed' along with requested statuses as it is the resolved status from Phase 3/4
    SELECT count(*) 
    INTO processed_count
    FROM public.returns 
    WHERE status IN ('inspected', 'relisted', 'rejected', 'completed');

    -- Sum up ai_suggested_price for total money saved
    SELECT COALESCE(sum(ai_suggested_price), 0)
    INTO total_resale
    FROM public.returns 
    WHERE status IN ('inspected', 'relisted', 'rejected', 'completed');

    -- Calculate total CO2 saved (2.4 kg per processed return)
    co2_saved := processed_count * 2.4;

    -- Count items diverted (relisted or donated)
    SELECT count(*)
    INTO diverted_count
    FROM public.returns
    WHERE status = 'relisted' OR ai_routing_decision = 'donate';

    -- Update the single row in platform_stats
    UPDATE public.platform_stats
    SET 
        total_returns_processed = processed_count,
        total_co2_saved_kg = co2_saved,
        total_money_saved_inr = total_resale,
        total_items_diverted = diverted_count,
        last_updated = now()
    WHERE id = 1;

END;
$$ LANGUAGE plpgsql;

-- Set permissions for the web app to read platform stats and insert logs
GRANT SELECT ON public.platform_stats TO anon, authenticated;
GRANT SELECT, INSERT ON public.green_credits_log TO anon, authenticated;
