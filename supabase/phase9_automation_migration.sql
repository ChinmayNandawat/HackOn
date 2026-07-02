-- Phase 9: Seller Automation Rules

CREATE TABLE IF NOT EXISTS seller_automation_rules (
  seller_id UUID PRIMARY KEY REFERENCES users(id),
  enabled BOOLEAN DEFAULT true,
  max_item_value NUMERIC DEFAULT 5000,
  min_trust_score INTEGER DEFAULT 80,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default rules for the demo seller
INSERT INTO seller_automation_rules (seller_id, enabled, max_item_value, min_trust_score)
VALUES ('00000000-0000-0000-0000-000000000001', true, 5000, 80)
ON CONFLICT (seller_id) DO NOTHING;
