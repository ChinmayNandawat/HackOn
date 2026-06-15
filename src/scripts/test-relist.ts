import pkg from "@next/env";
const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching an eligible return to relist...");
  const { data: returns, error } = await supabase
    .from('returns')
    .select('id, status, ai_routing_decision')
    .eq('status', 'accepted')
    .in('ai_routing_decision', ['relist_as_refurbished', 'needs_repair_then_relist'])
    .limit(5);

  if (error || !returns || returns.length === 0) {
    console.log("No accepted returns ready for relisting. Let's find ANY return and force it to be eligible.");
    const { data: anyReturn } = await supabase
      .from('returns')
      .select('id')
      .limit(1)
      .single();
    
    if (anyReturn) {
      const returnId = anyReturn.id;
      console.log(`Found a return: ${returnId}. Forcing it to be eligible...`);
      await supabase.from('returns').update({
        status: 'accepted',
        ai_routing_decision: 'relist_as_refurbished',
        flaws_json: { estimated_resale_price: 15000, flaws: [] }
      }).eq('id', returnId);
      
      console.log(`Return updated. Making API request to /api/relist`);
      await triggerRelist(returnId);
    } else {
      console.log("Could not find any returns at all in the database.");
    }
    return;
  }

  const returnId = returns[0].id;
  console.log(`Found eligible returnId: ${returnId}. Making API request to /api/relist...`);
  await triggerRelist(returnId);
}

async function triggerRelist(returnId: string) {
  try {
    const res = await fetch("http://localhost:3000/api/relist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnId })
    });
    
    const data = await res.json();
    console.log("Relist API Response:", data);
    
    if (data.success && data.newProductId) {
      console.log("\nVerifying the new product in the database...");
      const { data: newProd } = await supabase
        .from('products')
        .select('title, location, local_deal_price, standard_price, local_only_until, current_price')
        .eq('id', data.newProductId)
        .single();
        
      console.log("Created Product:", newProd);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

main().catch(console.error);
