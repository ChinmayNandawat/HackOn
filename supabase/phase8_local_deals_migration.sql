ALTER TABLE products ADD COLUMN location text;
ALTER TABLE products ADD COLUMN local_only_until timestamptz;
ALTER TABLE products ADD COLUMN local_deal_price numeric;
ALTER TABLE products ADD COLUMN standard_price numeric;
