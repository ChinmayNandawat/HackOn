import { NextRequest, NextResponse } from "next/server";
import { invokeVisionModel } from "@/lib/bedrock";

export interface GradeRequest {
  imageUrls: string[];
  productCategory: string;
}

export interface GradingFlaw {
  name: string;
  severity: "minor" | "moderate" | "major";
  x_percent: number; // 0 to 100
  y_percent: number; // 0 to 100
  width_percent: number; // 0 to 100
  height_percent: number; // 0 to 100
}

export interface GradingResult {
  grade: "A" | "B" | "C" | "D";
  score: number; // 0 to 100
  flaws: GradingFlaw[];
  confidence: "high" | "medium" | "low";
  summary: string;
}

interface ErrorResponse {
  error: string;
  rawResponse?: string; // only returned on parsing failure for debugging
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GradingResult | ErrorResponse>> {
  try {
    // 1. Parse request body
    let body: GradeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { imageUrls, productCategory } = body;

    // 2. Validate request parameters
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "imageUrls must be a non-empty array." },
        { status: 400 }
      );
    }

    if (imageUrls.length > 4) {
      return NextResponse.json(
        { error: "Maximum of 4 images allowed." },
        { status: 400 }
      );
    }

    if (!productCategory || typeof productCategory !== "string") {
      return NextResponse.json(
        { error: "productCategory must be a non-empty string." },
        { status: 400 }
      );
    }

    // Check that all image URLs are secure (https)
    for (const url of imageUrls) {
      if (typeof url !== "string" || !url.startsWith("https")) {
        return NextResponse.json(
          { error: "All imageUrls must start with 'https'." },
          { status: 400 }
        );
      }
    }

    // 3. Construct Claude Vision Prompt
    const gradingPrompt = `You are an expert Amazon returns quality inspector with 10 years of experience grading returned products.
Analyze all the provided images of this returned product in the category "${productCategory}" carefully to identify any cosmetic or functional flaws.

Return a strict, valid JSON object containing the inspection result. Follow these rules:
1. Return ONLY the raw JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json, do NOT output any introductory text, explanation, or notes.
2. The JSON structure must be exactly as follows:
{
  "grade": "A" | "B" | "C" | "D",
  "score": number (0 to 100),
  "flaws": [
    {
      "name": "string describing the flaw (e.g. scratch on screen, scuff on corner)",
      "severity": "minor" | "moderate" | "major",
      "x_percent": number (0 to 100, left edge of bounding box as percentage of width),
      "y_percent": number (0 to 100, top edge of bounding box as percentage of height),
      "width_percent": number (0 to 100),
      "height_percent": number (0 to 100)
    }
  ],
  "confidence": "high" | "medium" | "low",
  "summary": "a one sentence plain English description of overall condition"
}

3. Grade rules:
- Grade A: Like new condition with no visible defects, score 85 to 100.
- Grade B: Good condition with minor cosmetic defects, score 65 to 84.
- Grade C: Fair condition with visible damage that affects appearance but not function, score 40 to 64.
- Grade D: Poor condition with significant damage affecting function or missing parts, score 0 to 39.

Make sure all coordinate percentages are relative from 0 to 100. Let's begin.`;

    // 4. Invoke the Bedrock Vision Model
    let rawResponse: string;
    try {
      rawResponse = await invokeVisionModel(gradingPrompt, imageUrls, 2000);
    } catch (err: any) {
      console.error("[api/grade] AWS Bedrock call failed:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        httpStatusCode: err.$metadata?.httpStatusCode,
        requestId: err.$metadata?.requestId,
      });
      return NextResponse.json(
        { error: "AI grading service is temporarily unavailable." },
        { status: 500 }
      );
    }

    // 5. Clean and parse Claude's JSON response
    let parsedResult: GradingResult;
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
      console.error("[api/grade] Failed to parse JSON response:", parseErr, "Raw output:", rawResponse);
      return NextResponse.json(
        { 
          error: "AI returned malformed JSON.",
          rawResponse: rawResponse 
        },
        { status: 500 }
      );
    }

    // 6. Validate the grade output format
    const validGrades = ["A", "B", "C", "D"];
    if (!validGrades.includes(parsedResult.grade)) {
      console.error("[api/grade] Invalid grade returned from AI:", parsedResult.grade);
      return NextResponse.json(
        { error: "AI returned an invalid condition grade." },
        { status: 500 }
      );
    }

    // 7. Return the validated grading result
    return NextResponse.json(parsedResult, { status: 200 });

  } catch (globalErr: any) {
    console.error("[api/grade] Global endpoint error:", {
      name: globalErr.name,
      message: globalErr.message,
      stack: globalErr.stack,
      httpStatusCode: globalErr.$metadata?.httpStatusCode,
      requestId: globalErr.$metadata?.requestId,
    });
    return NextResponse.json(
      { error: "An internal server error occurred while processing the grade request." },
      { status: 500 }
    );
  }
}
