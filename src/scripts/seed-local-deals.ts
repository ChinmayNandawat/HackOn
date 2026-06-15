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
  console.log("🌱 Starting Local Deals Data Seeder...\n");

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_refurbished', true)
    .limit(2);

  if (error || !products || products.length === 0) {
    console.error("❌ Failed to fetch refurbished products or none found:", error);
    process.exit(1);
  }

  const CITIES = ["Mumbai", "Delhi"];
  const HOURS_AHEAD = 24;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const location = CITIES[i % CITIES.length];
    const localOnlyUntil = new Date(Date.now() + HOURS_AHEAD * 60 * 60 * 1000).toISOString();
    
    // Ensure current_price is valid
    const currentPrice = product.current_price || product.estimated_resale_price || Math.floor((product.original_price || 0) * 0.8);
    const standardPrice = Math.floor(currentPrice * 1.10); // 10% markup

    console.log(`Updating product "${product.title}" (${product.id})`);
    console.log(`  -> Location: ${location}`);
    console.log(`  -> Local Deal Price: ₹${currentPrice}`);
    console.log(`  -> Standard Price: ₹${standardPrice}`);
    console.log(`  -> Deal Window Ends: ${localOnlyUntil}\n`);

    const { error: updateError } = await supabase
      .from('products')
      .update({
        location: location,
        local_only_until: localOnlyUntil,
        local_deal_price: currentPrice,
        standard_price: standardPrice,
        current_price: currentPrice
      })
      .eq('id', product.id);

    if (updateError) {
      console.error(`❌ Failed to update product ${product.id}:`, updateError);
      process.exit(1);
    }
  }

  console.log("✅ Demo local deals seeded successfully!");
  console.log("👉 Set your location to 'Mumbai' or 'Delhi' in the Navbar to see the deals.");
}

main().catch(console.error);
