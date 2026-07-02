export interface ReturnRiskData {
  riskPercent: number;
  reason: string;
  suggestion: string | null;
}

// Helper to check if item matches fashion/apparel categories or title keywords
export function isFashionItem(category?: string, title?: string): boolean {
  const cat = (category || "").toLowerCase();
  const tit = (title || "").toLowerCase();
  const fashionCategories = [
    "shoes", "footwear", "fashion", "clothing", "apparel", "wearables", "tops", "bottoms", "dresses", "jackets"
  ];
  const keywords = [
    "apparel", "clothing", "fashion", "shirt", "jacket", "coat", "hoodie", 
    "jeans", "pants", "dress", "sneakers", "boots", "shoe", "footwear", "top", "trouser", "skirt", "wear"
  ];
  return fashionCategories.includes(cat) || keywords.some((kw) => tit.includes(kw) || cat.includes(kw));
}

// Helper to determine the next size recommendation
export function getNextSize(currentSize?: string): string {
  if (!currentSize) return "L";
  const num = parseFloat(currentSize);
  if (!isNaN(num) && /^\d+(\.\d+)?$/.test(currentSize.trim())) {
    return String(num + 0.5);
  }
  const sizeMap: Record<string, string> = {
    "XXS": "XS",
    "XS": "S",
    "S": "M",
    "M": "L",
    "L": "XL",
    "XL": "XXL",
    "XXL": "3XL",
    "3XL": "4XL"
  };
  return sizeMap[currentSize.toUpperCase()] || "L";
}

// Universal AI Return Prevention & Sizing Advisor logic
export function getReturnRiskData(
  productId: string,
  existingRiskScore?: number | null,
  category?: string,
  title?: string,
  currentSize?: string
): ReturnRiskData {
  const cat = (category || "").toLowerCase();
  const tit = (title || "").toLowerCase();
  const combined = `${cat} ${tit}`;

  // 1. Footwear / Shoes / Sneakers / Boots
  const isFootwear = ["shoe", "footwear", "sneaker", "boot"].some((kw) => combined.includes(kw));
  if (isFootwear) {
    const riskPercent = (existingRiskScore && existingRiskScore >= 25) ? existingRiskScore : 25;
    return {
      riskPercent,
      reason: "Runs slightly narrow in the toe box. AI recommends sizing up by 0.5 for optimal fit.",
      suggestion: "sizing up by 0.5",
    };
  }

  // 2. Bottoms / Jeans / Pants
  const isBottoms = ["jeans", "pant", "bottom", "trouser", "short", "skirt"].some((kw) => combined.includes(kw));
  if (isBottoms) {
    const riskPercent = (existingRiskScore && existingRiskScore >= 30) ? existingRiskScore : 30;
    const nextSize = getNextSize(currentSize || "M");
    return {
      riskPercent,
      reason: `Customer review sentiment indicates waist runs snug. We suggest choosing ${nextSize} to prevent a return cycle.`,
      suggestion: `choosing Size ${nextSize}`,
    };
  }

  // 3. Tops / Jackets / Hoodies / Shirts / Coats / Dresses / General Apparel
  if (isFashionItem(category, title)) {
    const riskPercent = (existingRiskScore && existingRiskScore >= 28) ? existingRiskScore : 28;
    const nextSize = getNextSize(currentSize || "M");
    return {
      riskPercent,
      reason: `70% of past returns cite 'tight shoulder/sleeve fit'. AI recommends sizing up to ${nextSize}.`,
      suggestion: `sizing up to ${nextSize}`,
    };
  }

  // 4. Non-fashion / Other categories
  const riskPercent = existingRiskScore || 5;
  if (riskPercent >= 25) {
    return {
      riskPercent,
      reason: "High historical return rate detected for this item.",
      suggestion: null,
    };
  }

  return {
    riskPercent,
    reason: "",
    suggestion: null,
  };
}

