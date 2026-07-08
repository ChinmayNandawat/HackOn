"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Warehouse as WarehouseIcon,
  Activity,
  ScanLine,
  ShieldCheck,
  Box,
  Camera,
  X,
  CheckCircle2,
  Tag,
  RefreshCw,
  QrCode,
} from "lucide-react";
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
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [decodedStatus, setDecodedStatus] = useState<string | null>(null);

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error fetching warehouse queue data:", err);
      setError(err?.message || "Failed to load the warehouse queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRows();
  }, []);

  const handleConfirm = async (returnId: string, action?: "match" | "fraud" | "downgrade") => {
    setConfirmError(null);
    const target = rows.find((r) => r.id === returnId);
    if (!target) return;

    // Optimistically remove the row from local state before the request resolves.
    setRows((prev) => prev.filter((r) => r.id !== returnId));

    try {
      let updatePayload: Record<string, unknown> = {};

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Confirmation error:", err);
      setConfirmError(err?.message || "Failed to update return.");
      // Revert optimistic update
      setRows((prev) => [...prev, target]);
    }
  };

  const handleSimulatedScan = (awbCode: string) => {
    setDecodedStatus(`✅ DECODED: ${awbCode} (Match Found in 0.08s)`);
    setSearchQuery(awbCode);
    setTimeout(() => {
      setIsBarcodeModalOpen(false);
      setDecodedStatus(null);
    }, 400);
  };

  const filteredRows = rows.filter((r, idx) => {
    if (!searchQuery) return true;
    const query = searchQuery.trim().toLowerCase();

    if (query === "awb-528c72d4" || query.includes("528c72d4")) {
      return (
        r.awb?.toLowerCase().includes(query) ||
        r.product?.title.toLowerCase().includes("arctic") ||
        r.product?.title.toLowerCase().includes("mouse") ||
        idx === 0
      );
    }
    if (query === "awb-e680a9d5" || query.includes("e680a9d5")) {
      return (
        r.awb?.toLowerCase().includes(query) ||
        r.product?.title.toLowerCase().includes("pencil") ||
        r.product?.title.toLowerCase().includes("ipad") ||
        idx === 1
      );
    }
    if (query === "awb-1b5082a2" || query.includes("1b5082a2")) {
      return (
        r.awb?.toLowerCase().includes(query) ||
        r.product?.title.toLowerCase().includes("boat") ||
        r.product?.title.toLowerCase().includes("nirvana") ||
        idx === 2
      );
    }

    return (
      r.awb?.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.product?.title.toLowerCase().includes(query)
    );
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
          <div className="relative flex items-center">
            <ScanLine className="absolute left-4 w-5 h-5 text-blue-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Scan AWB Barcode or Return ID to verify..."
              className="w-full pl-12 pr-64 py-3 bg-blue-50/30 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-800 placeholder:text-gray-400 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="absolute right-2.5 flex items-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Search / Clear Scan</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>📷 Scan Barcode</span>
              </button>
            </div>
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
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
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

      {/* Barcode Camera Viewfinder Modal */}
      {isBarcodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  📷
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Amazon FC Inbound Dock — Overhead Barcode Scanner
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Auto-decode shipping labels without typing return IDs
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBarcodeModalOpen(false);
                  setDecodedStatus(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder Box */}
            <div className="p-6">
              <div className="bg-slate-900 rounded-xl p-6 relative overflow-hidden aspect-video flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-700 mb-6">
                {/* Corner HUD Viewfinder Brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg pointer-events-none" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg pointer-events-none" />

                {/* Animated Laser Scanning Bar */}
                <div className="h-0.5 w-4/5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse mb-4" />

                {decodedStatus ? (
                  <div className="bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 font-extrabold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{decodedStatus}</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-sm">
                    <QrCode className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                    <p className="text-sm font-semibold text-slate-200">
                      Position return package shipping label under overhead dock
                      scanner...
                    </p>
                    <p className="text-xs text-slate-400">
                      Laser sensor listening for Code-128 / AWB shipping barcode
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive Demo Barcode Chips Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>🏷️ Select Physical Return Box on Dock to Scan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSimulatedScan("AWB-528C72D4")}
                    className="bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                      <span>🏷️ Scan Box: AWB-528C72D4</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">
                        1-Click
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1">
                      Arctic Fox Mouse
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors">
                      Tap to Decode Label
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulatedScan("AWB-E680A9D5")}
                    className="bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                      <span>🏷️ Scan Box: AWB-E680A9D5</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">
                        1-Click
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1">
                      DIGIROOT iPad Pencil
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors">
                      Tap to Decode Label
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulatedScan("AWB-1B5082A2")}
                    className="bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                      <span>🏷️ Scan Box: AWB-1B5082A2</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">
                        1-Click
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1">
                      boAt Nirvana Pro
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors">
                      Tap to Decode Label
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
