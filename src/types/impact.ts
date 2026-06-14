export interface ImpactResponse {
  personal: {
    itemsDiverted: number;
    co2SavedKg: number;
    greenCredits: number;
    tier: "Bronze" | "Silver" | "Gold";
  };
  global: {
    totalReturnsProcessed: number;
    totalCo2SavedKg: number;
    totalMoneySavedInr: number;
  };
  tierThresholds: {
    bronze: number;
    silver: number;
    gold: number;
  };
}
