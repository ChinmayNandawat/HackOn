-- Phase 10: Warehouse Staff Persona

-- Physical handling confirmation timestamp. NULL = not yet physically confirmed by warehouse staff.
-- Does NOT replace or interact with the existing `status` column.
ALTER TABLE returns ADD COLUMN IF NOT EXISTS warehouse_confirmed_at TIMESTAMPTZ;

-- AI-derived fraud/condition-origin classification, produced alongside grading.
-- One of: manufacturing_defect | transit_damage | customer_caused | inconclusive
ALTER TABLE returns ADD COLUMN IF NOT EXISTS damage_origin TEXT;

-- Allow the new hardcoded persona role. Existing 'buyer'/'seller' rows are unaffected.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('buyer', 'seller', 'warehouse'));

-- Hardcoded Warehouse Staff identity, following the same pattern as the seed buyer/seller rows in schema.sql.
INSERT INTO users (id, role, name)
VALUES ('00000000-0000-0000-0000-000000000003', 'warehouse', 'Warehouse Team')
ON CONFLICT (id) DO NOTHING;
