const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("1. Fetching a low-value product for the test...");
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .lt('original_price', 5000)
    .limit(1);

  if (prodErr || !products || products.length === 0) {
    console.error("Failed to fetch product:", prodErr);
    return;
  }
  const product = products[0];
  console.log(`Selected: ${product.title} (Price: ${product.original_price})`);

  console.log("2. Creating a dummy return record (status: processing)...");
  
  const { data: newReturn, error: retErr } = await supabase
    .from('returns')
    .insert({
      buyer_id: '00000000-0000-0000-0000-000000000002',
      product_id: product.id,
      status: 'processing',
      reason: 'changed mind',
      return_photo_urls: [
        'https://m.media-amazon.com/images/I/41N7a-z09fL.jpg'
      ]
    })
    .select()
    .single();

  if (retErr || !newReturn) {
    console.error("Failed to create return:", retErr);
    return;
  }
  console.log(`Created Return ID: ${newReturn.id}`);

  console.log("3. Triggering /api/process-return-ai endpoint...");
  try {
    const res = await fetch('http://localhost:3000/api/process-return-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnId: newReturn.id })
    });
    
    const result = await res.json();
    console.log("API Response:", result);

    console.log("4. Verifying database state...");
    const { data: updatedReturn, error: upErr } = await supabase
      .from('returns')
      .select('status, flaws_json, ai_routing_decision')
      .eq('id', newReturn.id)
      .single();

    if (upErr) {
      console.error("Failed to fetch updated return:", upErr);
      return;
    }
    
    console.log("Updated Return Status:", updatedReturn.status);
    console.log("AI Routing Decision:", updatedReturn.ai_routing_decision);
    console.log("Auto-Approved Flag:", updatedReturn.flaws_json?.auto_approved ? "TRUE" : "FALSE");
    
    if (updatedReturn.flaws_json?.auto_approved) {
      console.log("✅ SUCCESS: The return was successfully auto-approved by the backend!");
    } else {
      console.log("⚠️ NOTE: The return was NOT auto-approved. This is expected if the randomized Trust Score for this specific UUID was < 80%.");
    }

  } catch (err) {
    console.error("API Call failed:", err);
  }
}

runTest();
