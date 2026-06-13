-- Create tables for ReLife project

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GREEN CREDITS
CREATE TABLE green_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'refurbished')),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D')),
  return_risk_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RETURNS
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'decision_ready', 'completed')),
  ai_grade TEXT CHECK (ai_grade IN ('A', 'B', 'C', 'D')),
  ai_score INTEGER,
  ai_routing_decision TEXT,
  ai_confidence TEXT CHECK (ai_confidence IN ('High', 'Medium', 'Low')),
  flaws_json JSONB,
  original_photo_urls TEXT[],
  return_photo_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- SEED DATA
-- -----------------------------------------------------------------------------

-- Create a dummy seller
INSERT INTO users (id, role, name) VALUES ('00000000-0000-0000-0000-000000000001', 'seller', 'Amazon Renewed Store');
-- Create a dummy buyer
INSERT INTO users (id, role, name) VALUES ('00000000-0000-0000-0000-000000000002', 'buyer', 'Conscious Shopper');

-- Seed Products
INSERT INTO products (seller_id, title, description, original_price, current_price, category, image_url, condition, return_risk_score) 
VALUES 
('00000000-0000-0000-0000-000000000001', 'Sony WH-1000XM5 Wireless Headphones', 'Industry leading noise canceling headphones', 29900.00, 29900.00, 'Electronics', 'https://m.media-amazon.com/images/I/41O9Xm8E5NL._SX300_SY300_QL70_FMwebp_.jpg', 'new', 15),
('00000000-0000-0000-0000-000000000001', 'Nike Air Max 270', 'Men''s running shoes', 12500.00, 12500.00, 'Shoes', 'https://m.media-amazon.com/images/I/71D9ImsvEtL._UY695_.jpg', 'new', 73),
('00000000-0000-0000-0000-000000000001', 'Apple iPhone 14 Pro (128GB)', 'Super Retina XDR display', 119900.00, 119900.00, 'Electronics', 'https://m.media-amazon.com/images/I/61HHS0HrjpL._SX679_.jpg', 'new', 10),
('00000000-0000-0000-0000-000000000001', 'Levis Men''s Regular Fit Jeans', 'Classic straight fit', 2999.00, 2999.00, 'Clothing', 'https://m.media-amazon.com/images/I/81-pSXXtQkL._UX569_.jpg', 'new', 45);

-- Seed a Refurbished Product
INSERT INTO products (seller_id, title, description, original_price, current_price, category, image_url, condition, grade, return_risk_score) 
VALUES 
('00000000-0000-0000-0000-000000000001', 'Garmin Forerunner 245 (Refurbished)', 'GPS running smartwatch', 24000.00, 14000.00, 'Electronics', 'https://m.media-amazon.com/images/I/51wB7PZc5WL._SX679_.jpg', 'refurbished', 'A', 5);
