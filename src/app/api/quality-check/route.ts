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

    const prompt = `You are a fast, high-precision pre-upload photo validator for an e-commerce returns app. 
The user claims the provided image contains a returned product in the category: "${productCategory}".

Evaluate the image against these strict boundary thresholds:
1. CATEGORY MATCH: Does the image plausibly contain a product from the category "${productCategory}"?
2. SHARPNESS: Is the image sharp enough to read brand logos or inspect surface scratches? (Fail if motion blur obscures edges or fine texture).
3. LUMINANCE: Is the product adequately lit? (Fail if shadow/darkness obscures >30% of the item's surface).
4. AUTHENTICITY: Is it a real photo taken by a camera? (Strictly reject screenshots, digital mockups, photos of screens, or heavily filtered photos).

Return EXACTLY and ONLY raw JSON matching this format (no markdown code blocks, no intro/outro):
{
  "pass": boolean,
  "reason": "Clear confirmation if pass=true, or 1-sentence actionable user fix instruction if pass=false",
  "failedChecks": ["wrong_product", "blurry", "too_dark", "not_real_photo"]
}

Example valid output for a dark photo:
{"pass": false, "reason": "The photo is too dark to inspect surface condition. Please move to a brighter room or turn on flash.", "failedChecks": ["too_dark"]}`;

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
