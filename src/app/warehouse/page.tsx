"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Warehouse as WarehouseIcon, Activity, Search, ScanLine, ShieldCheck, Box } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  WarehouseReturnRecord,
  isInPhysicalHandlingQueue,
  isInEscalatedQueue,
} from "@/lib/warehouseQueues";
import PhysicalHandlingQueueSection, {
  PhysicalHandlingQueueItem,
} from "@/components/warehouse/PhysicalHandlingQueueSection";
import EscalatedQueueSection, {
  EscalatedQueueItem,
} from "@/components/warehouse/EscalatedQueueSection";

/**
 * A `WarehouseReturnRecord` enriched with the display fields both queue sections
 * need. This is the single row shape produced by the Warehouse_Queue_Page's
 * Supabase query (see design.md, "Warehouse_Queue_Page query shape") — it is a
 * structural superset of both `PhysicalHandlingQueueItem` and `EscalatedQueueItem`,
 * so the same mapped rows can be filtered into either section's array without
 * re-mapping.
 */
interface WarehouseRow extends WarehouseReturnRecord {
  ai_grade: string | null;
  ai_score: number | null;
  created_at: string;
  awb?: string; // Simulated Air Waybill for tracking
  image_urls?: string[]; // Added for Health Card
  product: {
    title: string;
    image_url: string | null;
  } | null;
}

export default function WarehouseQueuePage() {
  const [rows, setRows] = useState<WarehouseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("returns")
        .select(`
          id,
          status,
          ai_routing_decision,
          warehouse_confirmed_at,
          flaws_json,
          damage_origin,
          ai_grade,
          ai_score,
          created_at,
          return_photo_urls,
          products (
            title,
            image_url
          )
        `)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      const mappedData: WarehouseRow[] = (data || []).map((row: any) => ({
        id: row.id,
        status: row.status,
        ai_routing_decision: row.ai_routing_decision,
        warehouse_confirmed_at: row.warehouse_confirmed_at,
        flaws_json: row.flaws_json || {},
        damage_origin: row.damage_origin,
        ai_grade: row.ai_grade,
        ai_score: row.ai_score,
        created_at: row.created_at,
        awb: `AWB-${row.id.substring(0, 8).toUpperCase()}`, // Deterministic dummy AWB for scanner
        image_urls: row.return_photo_urls || [],
        product: Array.isArray(row.products) ? row.products[0] : row.products,
      }));

      setRows(mappedData);
    } catch (err: any) {
      console.error("Error fetching warehouse queue data:", err);
      setError(err?.message || "Failed to load the warehouse queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (returnId: string, action?: "match" | "fraud" | "downgrade") => {
    setConfirmError(null);
    const target = rows.find((r) => r.id === returnId);
    if (!target) return;

    // Optimistically remove the row from local state before the request resolves.
    setRows((prev) => prev.filter((r) => r.id !== returnId));

    try {
      let updatePayload: any = {};

      if (action === "match" || !action) {
        updatePayload = { warehouse_confirmed_at: new Date().toISOString() };
      } else if (action === "fraud") {
        updatePayload = {
          status: "inspected", // Put it in escalated queue
          flaws_json: { ...target.flaws_json, auto_approved: false, warehouse_override: "fraud" }
        };
      } else if (action === "downgrade") {
        updatePayload = {
          ai_routing_decision: "recycle",
          flaws_json: { ...target.flaws_json, warehouse_override: "downgrade" }
        };
      }

      const { error: updateErr } = await supabase
        .from("returns")
        .update(updatePayload)
        .eq("id", returnId);

      if (updateErr) {
        throw updateErr;
      }
    } catch (err: any) {
      console.error("Confirmation error:", err);
      setConfirmError(err?.message || "Failed to update return.");
      // Revert optimistic update
      setRows((prev) => [...prev, target]);
    }
  };

  const filteredRows = rows.filter(r => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return r.awb?.toLowerCase().includes(query) || r.id.toLowerCase().includes(query) || r.product?.title.toLowerCase().includes(query);
  });

  const physicalQueueItems: PhysicalHandlingQueueItem[] = filteredRows.filter(
    isInPhysicalHandlingQueue
  );
  const escalatedQueueItems: EscalatedQueueItem[] = filteredRows.filter(isInEscalatedQueue);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <WarehouseIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Fulfillment Center (FC)
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Inbound Reverse Logistics & Verification
              </p>
            </div>
          </div>
          
          {/* Hackathon Theme Analytics Header */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col px-3 border-r border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-500" /> Avg AI Inspection</span>
              <span className="text-lg font-black text-gray-800">12s <span className="text-xs font-semibold text-gray-400 line-through">4m avg</span></span>
            </div>
            <div className="flex flex-col px-3 border-r border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-500" /> Fraud Prevented</span>
              <span className="text-lg font-black text-gray-800">₹45,200</span>
            </div>
            <div className="flex flex-col px-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1"><Box className="w-3 h-3 text-purple-500" /> Binned Today</span>
              <span className="text-lg font-black text-gray-800">142</span>
            </div>
          </div>
        </header>

        {/* Barcode Scanner / Search */}
        <div className="mb-8 bg-white p-4 rounded-xl border border-blue-100 shadow-sm ring-1 ring-blue-50">
          <div className="relative">
            <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input
              type="text"
              placeholder="Scan AWB Barcode or Return ID to verify..."
              className="w-full pl-12 pr-4 py-3 bg-blue-50/30 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-800 placeholder:text-gray-400 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Searching...
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Error: {error}</p>
          </div>
        )}

        {confirmError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Error: {confirmError}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <PhysicalHandlingQueueSection
              records={physicalQueueItems}
              onConfirm={handleConfirm}
            />
            <EscalatedQueueSection records={escalatedQueueItems} />
          </div>
        )}
      </div>
    </main>
  );
}
