import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { returnId } = await req.json();

    if (!returnId) {
      return NextResponse.json({ error: "Missing returnId" }, { status: 400 });
    }

    // 1. Fetch return details
    const { data: returnData, error: fetchErr } = await supabase
      .from("returns")
      .select(`
        id,
        product_id,
        status,
        return_photo_urls,
        products (
          id,
          category,
          original_price
        )
      `)
      .eq("id", returnId)
      .single();

    if (fetchErr || !returnData) {
      console.error("[api/process-return-ai] Fetch error:", fetchErr);
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    const imageUrls = returnData.return_photo_urls || [];
    const product = Array.isArray(returnData.products) ? returnData.products[0] : returnData.products;
    const category = product?.category || "Unknown";
    const originalPrice = product?.original_price || 0;

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: "No images provided for inspection" }, { status: 400 });
    }

    // Ensure Absolute URL for internal API fetches
    const baseUrl = req.nextUrl.origin;

    // 2. Call vision grading API
    const gradeRes = await fetch(`${baseUrl}/api/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrls, productCategory: category }),
    });

    if (!gradeRes.ok) {
      const errTxt = await gradeRes.text();
      console.error("[api/process-return-ai] Grade failed:", errTxt);
      return NextResponse.json({ error: "Grading failed" }, { status: 500 });
    }
    const gradeResult = await gradeRes.json();

    // 3. Call routing decision API
    const routeRes = await fetch(`${baseUrl}/api/route-decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade: gradeResult.grade,
        score: gradeResult.score,
        productCategory: category,
        originalPrice: originalPrice,
        flawSummary: gradeResult.summary,
        confidence: gradeResult.confidence.toLowerCase(),
      }),
    });

    if (!routeRes.ok) {
      const errTxt = await routeRes.text();
      console.error("[api/process-return-ai] Route decision failed:", errTxt);
      return NextResponse.json({ error: "Routing decision failed" }, { status: 500 });
    }
    const routeResult = await routeRes.json();

    // 4. Update the returns table
    const combinedFlawsJson = {
      flaws: gradeResult.flaws || [],
      routing_reasoning: routeResult.reasoning,
      estimated_resale_price: routeResult.estimatedResalePrice || 0,
      suggested_refund_amount: routeResult.estimatedRefundAmount || 0,
      offer_sent_to_buyer: false,
    };

    const { error: updateErr } = await supabase
      .from("returns")
      .update({
        ai_grade: gradeResult.grade,
        ai_score: gradeResult.score,
        ai_confidence: gradeResult.confidence.charAt(0).toUpperCase() + gradeResult.confidence.slice(1),
        ai_routing_decision: routeResult.decision,
        status: "inspected",
        flaws_json: combinedFlawsJson,
      })
      .eq("id", returnId);

    if (updateErr) {
      console.error("[api/process-return-ai] Update error:", updateErr);
      return NextResponse.json({ error: "Failed to update return record" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "inspected" });
  } catch (error: any) {
    console.error("[api/process-return-ai] Unhandled exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
