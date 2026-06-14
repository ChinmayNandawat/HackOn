export interface ReturnRiskData {
  riskPercent: number;
  reason: string;
  suggestion: string | null;
}

// TODO: replace with /api/prevent once Member B ships it
export function getReturnRiskData(productId: string, existingRiskScore?: number | null): ReturnRiskData {
  // Use the database's return_risk_score if available, otherwise mock it between 10-60
  const riskPercent = existingRiskScore || Math.floor(Math.random() * 50) + 10;
  
  if (riskPercent >= 30) {
    return {
      riskPercent,
      reason: "Runs small in the shoulders",
      suggestion: "sizing up for a better fit",
    };
  }
  
  return {
    riskPercent,
    reason: "",
    suggestion: null,
  };
}
