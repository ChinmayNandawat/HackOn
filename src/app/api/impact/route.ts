import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface GlobalStats {
  total_returns_processed: number;
  total_co2_saved_kg: number;
  total_money_saved_inr: number;
  total_items_diverted: number;
  last_updated: string;
}

export interface PersonalStats {
  total_credits: number;
  personal_co2_saved: number;
  items_diverted: number;
  actions_taken: number;
  tier: "Bronze" | "Silver" | "Gold";
  next_tier_credits: number | null;
  tier_progress_percent: number;
}

export interface CreditsBreakdown {
  keep_and_refund: { credits: number; co2_saved_kg: number; description: string };
  buy_refurbished: { credits: number; co2_saved_kg: number; description: string };
  donate: { credits: number; co2_saved_kg: number; description: string };
  return_processed: { credits: number; co2_saved_kg: number; description: string };
}

export interface ImpactApiResponse {
  global: GlobalStats;
  personal: PersonalStats;
  credits_breakdown: CreditsBreakdown;
  is_mocked: boolean;
}

const CREDITS_RULES = {
  keep_and_refund: { credits: 50, co2_saved_kg: 2.4, description: "Keep item for partial refund" },
  buy_refurbished: { credits: 30, co2_saved_kg: 1.8, description: "Purchase a refurbished item" },
  donate: { credits: 80, co2_saved_kg: 0.5, description: "Donate item to charity" },
  return_processed: { credits: 10, co2_saved_kg: 0, description: "Standard return processed via ReLife" },
};

function calculateTier(totalCredits: number) {
  let tier: "Bronze" | "Silver" | "Gold" = "Bronze";
  let next_tier_credits: number | null = null;
  let tier_progress_percent = 0;

  if (totalCredits < 100) {
    tier = "Bronze";
    next_tier_credits = 100 - totalCredits;
    tier_progress_percent = (totalCredits / 100) * 100;
  } else if (totalCredits < 500) {
    tier = "Silver";
    next_tier_credits = 500 - totalCredits;
    tier_progress_percent = ((totalCredits - 100) / 400) * 100;
  } else {
    tier = "Gold";
    next_tier_credits = null;
    tier_progress_percent = 100;
  }

  return { tier, next_tier_credits, tier_progress_percent: Math.min(100, Math.max(0, Math.round(tier_progress_percent))) };
}

export async function GET(req: NextRequest) {
  try {
    let globalStats: GlobalStats | null = null;

    // 1. Fetch Global Stats
    const { data: statsData, error: statsError } = await supabase
      .from("platform_stats")
      .select("*")
      .eq("id", 1)
      .single();

    if (!statsError && statsData && statsData.total_returns_processed > 0) {
      globalStats = statsData as GlobalStats;
    } else {
      // Fallback: calculate live
      console.log("[api/impact] Falling back to live global stats calculation");
      const { data: returnsData } = await supabase
        .from("returns")
        .select("status, ai_suggested_price, ai_routing_decision");
        
      if (returnsData) {
        const processed = returnsData.filter(r => ['inspected', 'relisted', 'rejected', 'completed'].includes(r.status));
        const totalMoney = processed.reduce((sum, r) => sum + (Number(r.ai_suggested_price) || 0), 0);
        const totalDiverted = returnsData.filter(r => r.status === 'relisted' || r.ai_routing_decision === 'donate').length;
        
        globalStats = {
          total_returns_processed: processed.length,
          total_co2_saved_kg: processed.length * 2.4,
          total_money_saved_inr: totalMoney,
          total_items_diverted: totalDiverted,
          last_updated: new Date().toISOString()
        };
      }
    }

    // Failsafe global stats
    if (!globalStats) {
      globalStats = {
        total_returns_processed: 0,
        total_co2_saved_kg: 0,
        total_money_saved_inr: 0,
        total_items_diverted: 0,
        last_updated: new Date().toISOString()
      };
    }

    // 2. Fetch Personal Stats
    let personalStats: PersonalStats | null = null;
    let isMocked = true;
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const { data: logsData, error: logsError } = await supabase
        .from("green_credits_log")
        .select("*")
        .eq("session_id", sessionId);

      if (!logsError && logsData) {
        const totalCredits = logsData.reduce((sum, log) => sum + (Number(log.credits_earned) || 0), 0);
        const totalCo2 = logsData.reduce((sum, log) => sum + (Number(log.co2_saved_kg) || 0), 0);
        const actionsTaken = logsData.length;
        const itemsDiverted = logsData.filter(log => ['buy_refurbished', 'donate'].includes(log.action_type)).length;

        const { tier, next_tier_credits, tier_progress_percent } = calculateTier(totalCredits);

        personalStats = {
          total_credits: totalCredits,
          personal_co2_saved: totalCo2,
          items_diverted: itemsDiverted,
          actions_taken: actionsTaken,
          tier,
          next_tier_credits,
          tier_progress_percent
        };
        isMocked = false;
      }
    }

    if (!personalStats) {
      const { tier, next_tier_credits, tier_progress_percent } = calculateTier(0);
      personalStats = {
        total_credits: 0,
        personal_co2_saved: 0,
        items_diverted: 0,
        actions_taken: 0,
        tier,
        next_tier_credits,
        tier_progress_percent
      };
      isMocked = false;
    }

    const responseData: ImpactApiResponse = {
      global: globalStats,
      personal: personalStats,
      credits_breakdown: CREDITS_RULES,
      is_mocked: isMocked
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    console.error("[api/impact] GET Error:", error);
    
    // Always fall back to mock data on read failures
    const { tier, next_tier_credits, tier_progress_percent } = calculateTier(0);
    const fallbackResponse: ImpactApiResponse = {
      global: {
        total_returns_processed: 0,
        total_co2_saved_kg: 0,
        total_money_saved_inr: 0,
        total_items_diverted: 0,
        last_updated: new Date().toISOString()
      },
      personal: {
        total_credits: 0,
        personal_co2_saved: 0,
        items_diverted: 0,
        actions_taken: 0,
        tier,
        next_tier_credits,
        tier_progress_percent
      },
      credits_breakdown: CREDITS_RULES,
      is_mocked: false
    };
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, actionType, productId } = body;

    if (!sessionId || !actionType) {
      return NextResponse.json({ error: "Missing sessionId or actionType" }, { status: 400 });
    }

    const rule = CREDITS_RULES[actionType as keyof typeof CREDITS_RULES];
    if (!rule) {
      return NextResponse.json({ error: "Invalid actionType" }, { status: 400 });
    }

    // 1. Insert into green_credits_log
    const { data: newLog, error: insertError } = await supabase
      .from("green_credits_log")
      .insert({
        session_id: sessionId,
        action_type: actionType,
        credits_earned: rule.credits,
        co2_saved_kg: rule.co2_saved_kg,
        product_id: productId || null
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 2. Fetch all session logs to calculate new total credits
    const { data: sessionLogs } = await supabase
      .from("green_credits_log")
      .select("credits_earned")
      .eq("session_id", sessionId);

    const newTotalCredits = (sessionLogs || []).reduce((sum, log) => sum + (Number(log.credits_earned) || 0), 0);

    // 3. Update global stats (fetch first, then increment to avoid RPC for now)
    const { data: stats } = await supabase
      .from("platform_stats")
      .select("*")
      .eq("id", 1)
      .single();

    if (stats) {
      const isDiverted = ['buy_refurbished', 'donate'].includes(actionType);
      await supabase
        .from("platform_stats")
        .update({
          total_co2_saved_kg: Number(stats.total_co2_saved_kg || 0) + rule.co2_saved_kg,
          total_items_diverted: Number(stats.total_items_diverted || 0) + (isDiverted ? 1 : 0),
          last_updated: new Date().toISOString()
        })
        .eq("id", 1);
    }

    return NextResponse.json({
      success: true,
      log: newLog,
      newTotalCredits,
      message: `Successfully earned ${rule.credits} credits for ${actionType}`
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("[api/impact] POST Error:", error);
    return NextResponse.json({ error: "Failed to record impact action" }, { status: 500 });
  }
}
