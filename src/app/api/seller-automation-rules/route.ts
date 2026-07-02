import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEMO_SELLER_ID = '00000000-0000-0000-0000-000000000001';

// In-memory fallback if the DB table hasn't been created yet
let fallbackRules = {
  enabled: true,
  maxItemValue: 5000,
  minTrustScore: 80,
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("seller_automation_rules")
      .select("*")
      .eq("seller_id", DEMO_SELLER_ID)
      .single();

    if (error) {
      console.warn("[api/seller-automation-rules] DB table might not exist, using fallback rules.");
      return NextResponse.json(fallbackRules, { status: 200 });
    }

    if (data) {
      return NextResponse.json({
        enabled: data.enabled,
        maxItemValue: Number(data.max_item_value),
        minTrustScore: data.min_trust_score,
      }, { status: 200 });
    }

    return NextResponse.json(fallbackRules, { status: 200 });
  } catch (error) {
    console.error("[api/seller-automation-rules] GET Error:", error);
    return NextResponse.json(fallbackRules, { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Update the in-memory fallback immediately
    if (typeof body.enabled === "boolean") fallbackRules.enabled = body.enabled;
    if (typeof body.maxItemValue === "number") fallbackRules.maxItemValue = body.maxItemValue;
    if (typeof body.minTrustScore === "number") fallbackRules.minTrustScore = body.minTrustScore;

    // Try to update DB
    const { error } = await supabase
      .from("seller_automation_rules")
      .upsert({
        seller_id: DEMO_SELLER_ID,
        enabled: fallbackRules.enabled,
        max_item_value: fallbackRules.maxItemValue,
        min_trust_score: fallbackRules.minTrustScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'seller_id' });

    if (error) {
      console.warn("[api/seller-automation-rules] Could not save to DB (table might not exist), but saved in memory.");
    }

    return NextResponse.json({ success: true, rules: fallbackRules }, { status: 200 });
  } catch (error) {
    console.error("[api/seller-automation-rules] PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
