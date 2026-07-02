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
  marginCalculation?: string; // Step-by-step CoT reasoning for net profit margin
  decision: "relist_as_refurbished" | "needs_repair_then_relist" | "donate" | "recycle" | "keep_and_refund" | "reject";
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
    const routingPrompt = `You are a financial and sustainability routing expert for Amazon's circular returns processing system.
Analyze the product context and determine the most profitable, sustainable resale pathway.

### Product Context
- Category: ${productCategory}
- Grade: ${grade} | Score: ${score}/100
- Original Price: ₹${originalPrice} INR
- Condition Summary: ${flawSummary}
- AI Confidence: ${confidence}

### Logistics Constraints (INR)
- Estimated Return Shipping: ₹150 (<₹500), ₹200 (₹500-₹2000), ₹300 (>₹2000).

Return ONLY a raw, valid JSON object (no markdown wrapping) matching this exact schema:
{
  "marginCalculation": "Step-by-step CoT reasoning: calculate (Estimated Resale Price - Return Shipping Cost - Refurbishing Fee) vs. Keep-and-Refund loss.",
  "decision": "relist_as_refurbished" | "needs_repair_then_relist" | "donate" | "recycle" | "keep_and_refund" | "reject",
  "reasoning": "A 2-sentence explanation summarizing why this decision maximizes margin or sustainability.",
  "estimatedResalePrice": number (realistic refurbished price in INR, 0 if donate/recycle/keep),
  "estimatedRefundAmount": number (STRICTLY for 'keep_and_refund': 5% to 15% of original price),
  "confidenceScore": number (0 to 100)
}

DECISION RULES:
- If Grade is A or B and (Estimated Resale Price - Shipping) > 20% profit margin -> choose "relist_as_refurbished".
- If item value is low (<₹500) and minor flaw -> choose "keep_and_refund" with minimal 10% refund to avoid shipping loss.
- If item is a fraudulent mismatch -> choose "reject".`;

    // 4. Invoke the Bedrock Claude Model (text-only)
    let rawResponse: string;
    try {
      rawResponse = await invokeModel(routingPrompt, 1500);
    } catch (err: any) {
      console.warn("[api/route-decision] AWS Bedrock call failed, using mock response for demo:", err.message);
      
      // Fallback for demo
      rawResponse = JSON.stringify({
        marginCalculation: originalPrice < 5000 ? `Low item value (₹${originalPrice}); shipping cost (₹200) erodes profit margin. Keep-and-refund is most viable.` : `Resale value ₹${Math.round(originalPrice * 0.7)} minus ₹300 shipping yields positive >20% margin. Relist as refurbished.`,
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
      if (parsedResult.marginCalculation) {
        console.log("[api/route-decision] AI Margin CoT Reasoning:", parsedResult.marginCalculation);
      }
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
    const validDecisions = ["relist_as_refurbished", "needs_repair_then_relist", "donate", "recycle", "keep_and_refund", "reject"];
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
