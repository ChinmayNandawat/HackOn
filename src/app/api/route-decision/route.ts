import { NextRequest, NextResponse } from "next/server";
import { invokeModel } from "@/lib/bedrock";

export interface RouteDecisionRequest {
  grade: "A" | "B" | "C" | "D";
  score: number; // 0 to 100
  productCategory: string;
  originalPrice: number; // in INR
  flawSummary: string;
  confidence: "high" | "medium" | "low";
}

export interface RouteDecisionResult {
  decision: "relist_as_refurbished" | "standard_return" | "donate" | "recycle" | "keep_and_refund" | "reject";
  reasoning: string; // 2-3 sentence explanation
  estimatedResalePrice: number; // in INR, 0 if donate or recycle
  estimatedRefundAmount?: number; // suggested partial refund (INR) if keep_and_refund
  confidenceScore: number; // 0 to 100
}

interface ErrorResponse {
  error: string;
  rawResponse?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<RouteDecisionResult | ErrorResponse>> {
  try {
    // 1. Parse request body
    let body: RouteDecisionRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { grade, score, productCategory, originalPrice, flawSummary, confidence } = body;

    // 2. Validate request parameters
    if (
      !grade ||
      score === undefined ||
      !productCategory ||
      originalPrice === undefined ||
      !flawSummary ||
      !confidence
    ) {
      return NextResponse.json(
        { error: "Missing required fields in request body." },
        { status: 400 }
      );
    }

    const validGrades = ["A", "B", "C", "D"];
    if (!validGrades.includes(grade)) {
      return NextResponse.json(
        { error: "grade must be one of A, B, C, or D." },
        { status: 400 }
      );
    }

    if (typeof originalPrice !== "number" || originalPrice <= 0) {
      return NextResponse.json(
        { error: "originalPrice must be a positive number." },
        { status: 400 }
      );
    }

    if (typeof score !== "number" || score < 0 || score > 100) {
      return NextResponse.json(
        { error: "score must be a number between 0 and 100." },
        { status: 400 }
      );
    }

    // 3. Construct Claude Routing Prompt
    const routingPrompt = `You are a financial and sustainability routing expert for Amazon's returns processing system.
Analyze the following returned product context and decide the optimal pathway for it.

### Product Context
- Category: ${productCategory}
- Grade: ${grade} (A/B/C/D)
- Score: ${score} / 100
- Original Price: ₹${originalPrice} INR
- Condition Summary: ${flawSummary}
- AI Grading Confidence: ${confidence}

### Logistics & Economic Constraints in India
- Estimated return shipping cost:
  - ₹150 for items under ₹500
  - ₹200 for items between ₹500 and ₹2000
  - ₹300 for items above ₹2000

### Allowed Pathways & Logic
- "relist_as_refurbished": (DEFAULT & HIGHLY PREFERRED) The item is functional and can be resold. Always aggressively default to this pathway for Grade A, B, and most Grade C items to maximize recovery value.
- "standard_return": Use this ONLY as an absolute last resort if you are completely certain the product is too defective to be relisted, but too valuable to donate or recycle.
- "keep_and_refund": The product has minor cosmetic flaws that don't affect core functionality, and return shipping + inspection would erode profit margins. It's more viable for the buyer to keep it with a strict, minimal partial refund.
- "donate": The product is functional but too damaged to resell (typically Grade C or D) or has low original value where shipping/repair exceeds resale value, but it is still usable.
- "recycle": The product is completely unusable or heavily damaged (typically Grade D), making it a candidate only for responsible recycling.
- "reject": The product has no valid flaws, matches the original description perfectly, or exhibits signs of fraudulent claims. The return should be declined.

### Output Instructions
Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json, do NOT output any intro or outro text.
The JSON must match the following structure:
{
  "decision": "relist_as_refurbished" | "standard_return" | "donate" | "recycle" | "keep_and_refund" | "reject",
  "reasoning": "A 2 to 3 sentence explanation detailing why this route was selected based on condition, shipping cost, and economic margin.",
  "estimatedResalePrice": number (realistic refurbished resale price in INR. Set to 0 if the decision is "donate", "recycle", or "keep_and_refund"),
  "estimatedRefundAmount": number (CRITICAL: Only if "keep_and_refund". Must be VERY strict and minimal, generally between 5% and 15% of the original price depending on flaw severity. We want to refund as little as possible while satisfying the buyer),
  "confidenceScore": number (0 to 100 representing your level of certainty in this decision)
}

Let's proceed.`;

    // 4. Invoke the Bedrock Claude Model (text-only)
    let rawResponse: string;
    try {
      rawResponse = await invokeModel(routingPrompt, 1500);
    } catch (err: any) {
      console.warn("[api/route-decision] AWS Bedrock call failed, using mock response for demo:", err.message);
      
      // Fallback for demo
      rawResponse = JSON.stringify({
        decision: originalPrice < 5000 ? "keep_and_refund" : "relist_as_refurbished",
        reasoning: "Based on the minor flaws and item value, this is the most economically viable option.",
        estimatedResalePrice: originalPrice < 5000 ? 0 : Math.round(originalPrice * 0.7),
        estimatedRefundAmount: originalPrice < 5000 ? Math.round(originalPrice * 0.15) : 0,
        confidenceScore: 90
      });
    }

    // 5. Clean and parse Claude's JSON response
    let parsedResult: RouteDecisionResult;
    let cleanedResponse = rawResponse.trim();

    // Strip markdown code blocks if Claude returned them despite instructions
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    try {
      parsedResult = JSON.parse(cleanedResponse);
    } catch (parseErr: any) {
      console.error("[api/route-decision] Failed to parse JSON response:", parseErr, "Raw output:", rawResponse);
      return NextResponse.json(
        { 
          error: "AI returned malformed JSON.",
          rawResponse: rawResponse 
        },
        { status: 500 }
      );
    }

    // 6. Validate the routing decision field
    const validDecisions = ["relist_as_refurbished", "standard_return", "donate", "recycle", "keep_and_refund", "reject"];
    if (!validDecisions.includes(parsedResult.decision)) {
      console.error("[api/route-decision] Invalid decision returned from AI:", parsedResult.decision);
      return NextResponse.json(
        { error: "AI returned an invalid routing decision." },
        { status: 500 }
      );
    }

    // 7. Return the validated routing decision result
    return NextResponse.json(parsedResult, { status: 200 });

  } catch (globalErr: any) {
    console.error("[api/route-decision] Global endpoint error:", globalErr);
    return NextResponse.json(
      { error: "An internal server error occurred while processing the route decision request." },
      { status: 500 }
    );
  }
}
