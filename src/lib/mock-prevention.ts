export interface ReturnRiskData {
  riskPercent: number;
  reason: string;
  suggestion: string | null;
}

// TODO: replace with /api/prevent once Member B ships it
export function getReturnRiskData(productId: string, existingRiskScore?: number | null, category?: string): ReturnRiskData {
  // For demo: Ensure Shoes trigger the prevention banner.
  let riskPercent = existingRiskScore;
  
  if (category === 'Shoes' || category === 'Footwear') {
    // If the database score is missing or too low, mock it to 25% for the demo
    riskPercent = (existingRiskScore && existingRiskScore >= 25) ? existingRiskScore : 25;
  } else {
    // Default low risk for electronics/other to hide the banner
    riskPercent = existingRiskScore || 5;
  }
  
  if (riskPercent >= 25) {
    return {
      riskPercent,
      reason: "Runs narrow in the toe box",
      suggestion: "sizing up a size",
    };
  }
  
  return {
    riskPercent,
    reason: "",
    suggestion: null,
  };
}
