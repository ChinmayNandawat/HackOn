import pkg from "@next/env";
const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🌱 Starting Fashion Items Data Seeder...\n");

  const fashionProducts = [
    {
      seller_id: '00000000-0000-0000-0000-000000000001',
      title: 'Zara Oversized Vintage Denim Jacket',
      description: 'Classic oversized denim jacket crafted from 100% premium rigid cotton denim. AI-verified vintage condition with zero structural defects.',
      original_price: 4999.00,
      current_price: 2499.00,
      estimated_resale_price: 2499.00,
      category: 'Fashion',
      image_url: 'https://m.media-amazon.com/images/I/71wZgS6r1sL._SY741_.jpg',
      condition: 'refurbished',
      is_refurbished: true,
      grade: 'A',
      return_risk_score: 35,
      relist_status: 'active',
      health_data: {
        grade: 'A',
        score: 92,
        summary: 'Immaculate vintage denim, zero visible distress. Sanitized and AI-inspected.',
        confidence: '99%'
      }
    },
    {
      seller_id: '00000000-0000-0000-0000-000000000001',
      title: 'Levi\'s 501 Original Fit Men\'s Jeans',
      description: 'The iconic straight fit jean with button fly. Tested for durability and authentic styling.',
      original_price: 5499.00,
      current_price: 5499.00,
      category: 'Clothing',
      image_url: 'https://m.media-amazon.com/images/I/61Gq-j5i+7L._SY741_.jpg',
      condition: 'new',
      is_refurbished: false,
      return_risk_score: 45,
      relist_status: 'active'
    },
    {
      seller_id: '00000000-0000-0000-0000-000000000001',
      title: 'Adidas Originals Trefoil Heavyweight Hoodie',
      description: 'Ultra-plush heavyweight cotton hoodie featuring the signature embroidered trefoil logo on chest.',
      original_price: 6999.00,
      current_price: 3499.00,
      estimated_resale_price: 3499.00,
      category: 'Apparel',
      image_url: 'https://m.media-amazon.com/images/I/51rYgB6f8jL._SY741_.jpg',
      condition: 'refurbished',
      is_refurbished: true,
      grade: 'A',
      return_risk_score: 25,
      relist_status: 'active',
      health_data: {
        grade: 'A',
        score: 98,
        summary: 'Barely worn, ultra soft fleece interior intact. Professionally dry cleaned.',
        confidence: '98%'
      }
    },
    {
      seller_id: '00000000-0000-0000-0000-000000000001',
      title: 'H&M Floral Print Linen Midi Dress',
      description: 'Breathable woven linen blend dress with puff sleeves and square neckline. Perfect for summer.',
      original_price: 3999.00,
      current_price: 3999.00,
      category: 'Fashion',
      image_url: 'https://m.media-amazon.com/images/I/71Yf8u+1QeL._SY741_.jpg',
      condition: 'new',
      is_refurbished: false,
      return_risk_score: 40,
      relist_status: 'active'
    },
    {
      seller_id: '00000000-0000-0000-0000-000000000001',
      title: 'Puma RS-X Retro Chunky Sneakers',
      description: 'Bold retro-futuristic silhouette with RS cushioning technology for all-day comfort.',
      original_price: 9999.00,
      current_price: 4999.00,
      estimated_resale_price: 4999.00,
      category: 'Shoes',
      image_url: 'https://m.media-amazon.com/images/I/71N-E-P6W-L._SY695_.jpg',
      condition: 'refurbished',
      is_refurbished: true,
      grade: 'B',
      return_risk_score: 60,
      relist_status: 'active',
      health_data: {
        grade: 'B',
        score: 85,
        summary: 'Minor outsole wear, upper mesh pristine. Cleaned and sanitized by AI inspection.',
        confidence: '95%'
      }
    }
  ];

  console.log(`Inserting ${fashionProducts.length} fashion products into Supabase...`);

  const { data, error } = await supabase
    .from('products')
    .insert(fashionProducts)
    .select();

  if (error) {
    console.error("❌ Failed to insert fashion items:", error);
    process.exit(1);
  }

  console.log("✅ Successfully seeded fashion items!");
  console.log(`Inserted ${data?.length || 0} products.`);
}

main().catch(console.error);
