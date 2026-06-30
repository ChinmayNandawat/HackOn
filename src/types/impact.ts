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
  tier: "Seed" | "Sapling" | "Tree";
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
