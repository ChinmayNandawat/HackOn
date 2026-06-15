import { loadEnvConfig } from "@next/env";
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
  console.log("🌱 Starting Demo Impact Data Seeder...\n");

  // 1. Call recalculate_platform_stats() via RPC
  console.log("1. Recalculating platform stats from real returns data...");
  const { error: rpcError } = await supabase.rpc('recalculate_platform_stats');
  
  if (rpcError) {
    console.error("❌ Failed to recalculate platform stats:", rpcError);
    process.exit(1);
  }
  console.log("✅ Platform stats recalculated successfully.\n");

  // 2. Manually boost the platform_stats row
  console.log("2. Boosting platform stats for demo mature platform appearance...");
  const { data: statsRow, error: fetchError } = await supabase
    .from('platform_stats')
    .select('*')
    .eq('id', 1)
    .single();

  if (fetchError || !statsRow) {
    console.error("❌ Failed to fetch platform_stats:", fetchError);
    process.exit(1);
  }

  const boostedProcessed = Number(statsRow.total_returns_processed) + 1247;
  const boostedCo2 = Number(statsRow.total_co2_saved_kg) + 2993.0;
  const boostedMoney = Number(statsRow.total_money_saved_inr) + 3720000;
  const boostedDiverted = Number(statsRow.total_items_diverted) + 891;

  const { error: updateError } = await supabase
    .from('platform_stats')
    .update({
      total_returns_processed: boostedProcessed,
      total_co2_saved_kg: boostedCo2,
      total_money_saved_inr: boostedMoney,
      total_items_diverted: boostedDiverted,
      last_updated: new Date().toISOString()
    })
    .eq('id', 1);

  if (updateError) {
    console.error("❌ Failed to update platform_stats with boosts:", updateError);
    process.exit(1);
  }
  console.log("✅ Platform stats boosted successfully.\n");

  // 3. Insert 12 rows into green_credits_log for demo user
  const DEMO_SESSION_ID = 'demo-user-session-001';
  console.log(`3. Seeding green credits log for session: ${DEMO_SESSION_ID}...`);

  // Clear existing logs for idempotency
  await supabase.from('green_credits_log').delete().eq('session_id', DEMO_SESSION_ID);

  // Define exactly 12 rows as requested (7 specific actions + 5 padding)
  const actions = [
    { action_type: 'return_processed', credits_earned: 0, co2_saved_kg: 0 },
    { action_type: 'return_processed', credits_earned: 0, co2_saved_kg: 0 },
    { action_type: 'buy_refurbished', credits_earned: 30, co2_saved_kg: 1.8 },
    { action_type: 'buy_refurbished', credits_earned: 30, co2_saved_kg: 1.8 },
    { action_type: 'buy_refurbished', credits_earned: 30, co2_saved_kg: 1.8 },
    { action_type: 'donate', credits_earned: 0, co2_saved_kg: 0.5 },
    { action_type: 'keep_and_refund', credits_earned: 50, co2_saved_kg: 2.4 },
    { action_type: 'return_processed', credits_earned: 0, co2_saved_kg: 0 },
    { action_type: 'buy_refurbished', credits_earned: 30, co2_saved_kg: 1.8 },
    { action_type: 'return_processed', credits_earned: 0, co2_saved_kg: 0 },
    { action_type: 'return_processed', credits_earned: 0, co2_saved_kg: 0 },
    { action_type: 'donate', credits_earned: 0, co2_saved_kg: 0.5 }
  ];

  let totalDemoCredits = 0;
  let totalDemoCo2 = 0;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    // Spread created_at across last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const { error: insertError } = await supabase
      .from('green_credits_log')
      .insert({
        session_id: DEMO_SESSION_ID,
        action_type: action.action_type,
        credits_earned: action.credits_earned,
        co2_saved_kg: action.co2_saved_kg,
        created_at: date.toISOString()
      });

    if (insertError) {
      console.error(`❌ Failed to insert action ${i + 1}:`, insertError);
      process.exit(1);
    }

    totalDemoCredits += action.credits_earned;
    totalDemoCo2 += action.co2_saved_kg;
  }

  console.log(`✅ Seeded ${actions.length} rows into green_credits_log.\n`);

  // Log Summary
  console.log("==================================================");
  console.log("📊 SEEDING SUMMARY");
  console.log("==================================================");
  console.log(`[Platform Totals]`);
  console.log(`- Returns Processed : ${boostedProcessed.toLocaleString()}`);
  console.log(`- CO2 Saved (kg)    : ${boostedCo2.toLocaleString()}`);
  console.log(`- Money Saved (INR) : ₹${boostedMoney.toLocaleString()}`);
  console.log(`- Items Diverted    : ${boostedDiverted.toLocaleString()}`);
  console.log("");
  console.log(`[Demo Session Stats]`);
  console.log(`- Session ID        : ${DEMO_SESSION_ID}`);
  console.log(`- Total Credits     : ${totalDemoCredits}`);
  console.log(`- Personal CO2 Saved: ${totalDemoCo2.toFixed(1)} kg`);
  console.log("==================================================\n");
  console.log(`👉 Test the UI using URL parameter: ?sessionId=${DEMO_SESSION_ID}`);
}

main().catch(console.error);
