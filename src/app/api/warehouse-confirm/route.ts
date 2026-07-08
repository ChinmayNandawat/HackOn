import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface WarehouseConfirmRequestBody {
  returnId: string;
}

export interface WarehouseConfirmResponse {
  success: boolean;
  warehouseConfirmedAt?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Step 1: Validation
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<WarehouseConfirmResponse>(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const returnId = body?.returnId;
    if (!returnId || typeof returnId !== 'string' || returnId.trim() === '') {
      return NextResponse.json<WarehouseConfirmResponse>(
        { success: false, error: "returnId is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Step 2: Fetch the return record
    let returnData: { id: string; warehouse_confirmed_at: string | null };
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('id, warehouse_confirmed_at')
        .eq('id', returnId)
        .single();

      if (error || !data) {
        console.error("[api/warehouse-confirm] Supabase select error:", error);
        return NextResponse.json<WarehouseConfirmResponse>(
          { success: false, error: "Return record not found" },
          { status: 404 }
        );
      }
      returnData = data;
    } catch (err) {
      console.error("[api/warehouse-confirm] Exception fetching return:", err);
      return NextResponse.json<WarehouseConfirmResponse>(
        { success: false, error: "Internal server error while fetching return" },
        { status: 500 }
      );
    }

    // Step 3: Guard - already confirmed
    if (returnData.warehouse_confirmed_at !== null) {
      return NextResponse.json<WarehouseConfirmResponse>(
        { success: false, error: "This return has already been confirmed as physically moved." },
        { status: 409 }
      );
    }

    // Step 4: Update - scoped to warehouse_confirmed_at only
    const warehouseConfirmedAt = new Date().toISOString();
    try {
      const { error: updateError } = await supabase
        .from('returns')
        .update({ warehouse_confirmed_at: warehouseConfirmedAt })
        .eq('id', returnId);

      if (updateError) {
        console.error("[api/warehouse-confirm] Failed to update warehouse_confirmed_at:", updateError);
        return NextResponse.json<WarehouseConfirmResponse>(
          { success: false, error: "Failed to confirm physical routing" },
          { status: 500 }
        );
      }
    } catch (updateErr) {
      console.error("[api/warehouse-confirm] Exception updating return:", updateErr);
      return NextResponse.json<WarehouseConfirmResponse>(
        { success: false, error: "Internal server error while confirming physical routing" },
        { status: 500 }
      );
    }

    // Step 5: Return success response
    return NextResponse.json<WarehouseConfirmResponse>({
      success: true,
      warehouseConfirmedAt,
    });

  } catch (globalError: unknown) {
    console.error("[api/warehouse-confirm] Unhandled exception:", globalError);
    return NextResponse.json<WarehouseConfirmResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
