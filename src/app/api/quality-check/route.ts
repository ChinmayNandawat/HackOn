import { NextRequest, NextResponse } from "next/server";
import { invokeVisionModel } from "@/lib/bedrock";

export interface QualityCheckRequest {
  imageUrl: string;
  productCategory: string;
}

export interface QualityCheckResult {
  pass: boolean;
  reason: string;
  failedChecks: Array<"wrong_product" | "blurry" | "too_dark" | "not_real_photo">;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { imageUrl, productCategory } = body as Partial<QualityCheckRequest>;

    // Validate imageUrl
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("https")) {
      return NextResponse.json(
        { error: "imageUrl must be a non-empty string starting with 'https'" },
        { status: 400 }
      );
    }

    // Validate productCategory
    if (!productCategory || typeof productCategory !== "string" || productCategory.trim() === "") {
      return NextResponse.json(
        { error: "productCategory must be a non-empty string" },
        { status: 400 }
      );
    }

    const prompt = `You are a fast pre-upload photo validator for an e-commerce returns app. 
The user claims the provided image contains a returned product in the category: "${productCategory}".

Evaluate the image against the following criteria:
1. Does the image plausibly contain a product from the category "${productCategory}"?
2. Is the image in focus and not overly blurry?
3. Is the image adequately lit and not too dark?
4. Is it a real photo taken by a camera? (Reject screenshots, photos of other screens, heavily edited images, or completely blank backgrounds).

Return EXACTLY and ONLY raw JSON matching this format (no markdown formatting, no code fences like \`\`\`json):
{
  "pass": boolean,
  "reason": "positive confirmation if pass=true, or specific user-facing fix instruction if pass=false",
  "failedChecks": ["wrong_product", "blurry", "too_dark", "not_real_photo"] // Include only the ones that failed, empty array if pass=true
}`;

    const rawResponse = await invokeVisionModel(prompt, [imageUrl]);

    // Strip markdown fences if present
    let cleanedResponse = rawResponse.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```/, "");
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```$/, "");
    }
    cleanedResponse = cleanedResponse.trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("[api/quality-check] JSON Parse Error", parseError);
      return NextResponse.json(
        { error: "AI returned malformed JSON", raw: rawResponse },
        { status: 500 }
      );
    }

    // Validate parsed output
    if (
      typeof parsed.pass !== "boolean" ||
      typeof parsed.reason !== "string" ||
      parsed.reason.trim() === "" ||
      !Array.isArray(parsed.failedChecks)
    ) {
      console.error("[api/quality-check] Invalid JSON shape", parsed);
      return NextResponse.json(
        { error: "AI returned invalid JSON shape", raw: rawResponse },
        { status: 500 }
      );
    }

    const result: QualityCheckResult = {
      pass: parsed.pass,
      reason: parsed.reason,
      failedChecks: parsed.failedChecks,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[api/quality-check] Internal Error", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      httpStatusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    });
    return NextResponse.json(
      { error: "Internal server error during quality check" },
      { status: 500 }
    );
  }
}
