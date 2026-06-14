import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { invokeModel } from '@/lib/bedrock';

export interface RelistRequestBody {
  returnId: string;
}

export interface RelistResponse {
  success: boolean;
  newProductId?: string;
  generatedTitle?: string;
  generatedDescription?: string;
  sellerNote?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Step 1: Validation
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<RelistResponse>({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const returnId = body?.returnId;
    if (!returnId || typeof returnId !== 'string' || returnId.trim() === '') {
      return NextResponse.json<RelistResponse>(
        { success: false, error: "returnId is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Step 2: Fetch the return record
    let returnData: Record<string, unknown>;
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*, products(id, title, category, original_price, image_url)')
        .eq('id', returnId)
        .single();

      if (error || !data) {
        console.error("[api/relist] Supabase select error:", error);
        return NextResponse.json<RelistResponse>({ success: false, error: "Return record not found" }, { status: 404 });
      }
      returnData = data;
    } catch (err) {
      console.error("[api/relist] Exception fetching return:", err);
      return NextResponse.json<RelistResponse>({ success: false, error: "Internal server error while fetching return" }, { status: 500 });
    }

    if (returnData.status === 'relisted') {
      return NextResponse.json<RelistResponse>(
        { success: false, error: "This return has already been relisted." },
        { status: 409 }
      );
    }

    if (returnData.ai_routing_decision !== 'relist_as_refurbished' && returnData.ai_routing_decision !== 'needs_repair_then_relist') {
      return NextResponse.json<RelistResponse>(
        { success: false, error: "This return is not approved for relisting based on AI routing decision." },
        { status: 400 }
      );
    }

    const product = Array.isArray(returnData.products) ? returnData.products[0] : returnData.products;

    if (!product) {
       return NextResponse.json<RelistResponse>({ success: false, error: "Original product details missing from return record" }, { status: 404 });
    }

    // Step 3: Generate listing content using Bedrock
    const actualFlaws = returnData.flaws_json?.flaws || [];
    const flawsList = Array.isArray(actualFlaws) ? actualFlaws.map((f: Record<string, string>) => `- ${f.name || 'Flaw'} at severity ${f.severity || 'unknown'}`).join('\n') : "No major cosmetic flaws reported.";
    
    const prompt = `Act as an expert Amazon product listing copywriter. 
Create a refurbished product listing for the following item:
- Product Name: ${product.title}
- Category: ${product.category}
- Original Price: ₹${product.original_price}
- AI Grade: ${returnData.ai_grade || 'Unknown'}
- AI Score: ${returnData.ai_score || 'Unknown'}/100
- AI Confidence Level: ${returnData.ai_confidence || 'Unknown'}
- Cosmetic Flaws identified:
${flawsList}

Return ONLY a valid JSON object with absolutely no markdown wrapping, no HTML, and no explanation. The JSON object must contain exactly these fields:
{
  "title": "A compelling refurbished product listing title under 80 characters that honestly mentions the condition grade",
  "description": "A 2 to 3 sentence honest product description that highlights what works perfectly and clearly mentions any cosmetic flaws",
  "sellerNote": "One sentence note to build buyer trust, mentioning the AI verification and 30 day guarantee"
}`;

    let generatedTitle = `${product.title} - Refurbished Grade ${returnData.ai_grade || 'Unknown'}`;
    let generatedDescription = "AI inspected and verified refurbished product.";
    let sellerNote = "30-day AI Verified guarantee included.";

    try {
      const bedrockOutput = await invokeModel(prompt);
      
      // Attempt to parse JSON. Sometimes Bedrock returns wrapped markdown.
      const cleanedOutput = bedrockOutput.replace(/```json/i, '').replace(/```/i, '').trim();
      const parsed = JSON.parse(cleanedOutput);
      
      if (parsed.title) generatedTitle = parsed.title;
      if (parsed.description) generatedDescription = parsed.description;
      if (parsed.sellerNote) sellerNote = parsed.sellerNote;
    } catch (bedrockError) {
      console.error("[api/relist] Bedrock generation failed, using fallback values. Error:", bedrockError);
      // Fallback values are already set
    }

    // Step 4: Insert new product row
    const newProductPayload = {
      title: generatedTitle,
      description: generatedDescription,
      category: product.category,
      original_price: product.original_price,
      current_price: returnData.flaws_json?.estimated_resale_price || Math.floor(product.original_price * 0.8),
      image_url: product.image_url,
      condition: 'refurbished',
      is_refurbished: true,
      parent_product_id: product.id,
      health_data: {
        grade: returnData.ai_grade,
        score: returnData.ai_score,
        flaws: returnData.flaws_json?.flaws || [],
        confidence: returnData.ai_confidence,
        summary: returnData.flaws_json?.routing_reasoning || "",
        generatedDescription,
        sellerNote
      },
      estimated_resale_price: returnData.flaws_json?.estimated_resale_price || 0,
      relist_status: 'active',
      relisted_at: new Date().toISOString()
    };

    let insertedProduct: { id: string };
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('products')
        .insert([newProductPayload])
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }
      insertedProduct = insertData;
    } catch (insertError: unknown) {
      console.error("[api/relist] Product insertion failed:", insertError);
      return NextResponse.json<RelistResponse>(
        { success: false, error: "Failed to create new refurbished listing: " + (insertError instanceof Error ? insertError.message : JSON.stringify(insertError)) },
        { status: 500 }
      );
    }

    // Step 5: Update the return record
    try {
      const { error: updateError } = await supabase
        .from('returns')
        .update({ status: 'relisted' })
        .eq('id', returnId);

      if (updateError) {
        console.error("[api/relist] Failed to update return status, but product was inserted. Error:", updateError);
        // Note: In a robust production system, we might compensate/rollback the product insert here. 
        // For now, logging the error is sufficient per prompt constraints.
      }
    } catch (updateErr) {
      console.error("[api/relist] Exception updating return status:", updateErr);
    }

    // Step 6: Return success response
    return NextResponse.json<RelistResponse>({
      success: true,
      newProductId: insertedProduct.id,
      generatedTitle,
      generatedDescription,
      sellerNote
    });

  } catch (globalError: unknown) {
    console.error("[api/relist] Unhandled exception:", globalError);
    return NextResponse.json<RelistResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
