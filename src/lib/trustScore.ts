export interface BuyerTrustProfile {
  buyerId: string;
  orderVolume: number;       // Total past orders placed (e.g. 24)
  pastReturnRate: number;    // Percentage of orders returned (e.g. 4 for 4%)
  timingHours: number;       // Hours elapsed after delivery before return initiation (e.g. 14)
  score: number;             // Overall Trust Score (0 - 100)
  tier: "High Trust" | "Medium Trust" | "Low Trust";
  badgeColor: string;        // Tailwind styling for badges
  badgeBg: string;           // Light background color for cards/badges
  iconColor: string;         // Text color for icons/accents
}

/**
 * Computes a Buyer Trust Profile for a given return request using a real mathematical engine.
 * Synthesizes historical order volume, return rate, and return timing
 * to generate a 10-99% score that accurately classifies buyers into High, Medium, or Low trust tiers.
 */
export function calculateBuyerTrustScore(item: {
  id?: string;
  buyer_id?: string;
  return_reason?: string;
  created_at?: string;
  total_orders?: number;
  total_returns?: number;
  delivery_timestamp?: string;
  [key: string]: any;
}): BuyerTrustProfile {
  // 1. Elapsed Timing (timingHours)
  let timingHours = 14;
  if (item.delivery_timestamp && item.created_at) {
    const deliveryTime = new Date(item.delivery_timestamp).getTime();
    const returnTime = new Date(item.created_at).getTime();
    if (!isNaN(deliveryTime) && !isNaN(returnTime) && returnTime >= deliveryTime) {
      timingHours = Math.round((returnTime - deliveryTime) / 36e5);
    }
  }

  // 2. Order Volume (orderVolume)
  const orderVolume = typeof item.total_orders === "number" && item.total_orders > 0
    ? item.total_orders
    : 12;

  // 3. Return Rate (pastReturnRate)
  let pastReturnRate = 8;
  if (typeof item.total_returns === "number" && typeof item.total_orders === "number" && item.total_orders > 0) {
    pastReturnRate = Math.round((item.total_returns / item.total_orders) * 100);
  } else if (typeof item.total_returns === "number") {
    pastReturnRate = Math.round((item.total_returns / orderVolume) * 100);
  }

  // 4. Score Calculation Algorithm
  const baseScore = 70;
  const orderBonus = Math.min(20, orderVolume * 2);
  const returnPenalty = Math.min(40, Math.round(pastReturnRate * 1.5));
  const timingBonus = timingHours <= 12 ? 10 : (timingHours <= 48 ? 5 : 0);
  const rawScore = baseScore + orderBonus - returnPenalty + timingBonus;
  const score = Math.max(10, Math.min(99, rawScore));

  // 5. Dynamic Tier & Badge Classification
  let tier: "High Trust" | "Medium Trust" | "Low Trust";
  let badgeColor: string;
  let badgeBg: string;
  let iconColor: string;

  if (score >= 85) {
    tier = "High Trust";
    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    badgeBg = "bg-emerald-50/80";
    iconColor = "text-emerald-600";
  } else if (score >= 65) {
    tier = "Medium Trust";
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    badgeBg = "bg-amber-50/80";
    iconColor = "text-amber-600";
  } else {
    tier = "Low Trust";
    badgeColor = "bg-red-50 text-red-700 border-red-200";
    badgeBg = "bg-red-50/80";
    iconColor = "text-red-600";
  }

  return {
    buyerId: item.buyer_id || "00000000-0000-0000-0000-000000000002",
    orderVolume,
    pastReturnRate,
    timingHours,
    score,
    tier,
    badgeColor,
    badgeBg,
    iconColor,
  };
}
