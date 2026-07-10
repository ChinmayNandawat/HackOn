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
import BarcodeScanner from "@/components/warehouse/BarcodeScanner";

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

const DUMMY_WAREHOUSE_QUEUE: WarehouseRow[] = [
  {
    id: "uuid-wh-dummy-1",
    status: "accepted",
    ai_routing_decision: "relist_as_refurbished",
    warehouse_confirmed_at: null,
    flaws_json: {
      seller_approved: true,
      pickup_flagged: false,
      flaws: [
        { name: "Zipper Stuck", severity: "minor", image_index: 0, x_percent: 50, y_percent: 60, width_percent: 15, height_percent: 10 }
      ],
      return_photo_urls: ["https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png"]
    },
    damage_origin: "consumer_usage",
    ai_grade: "B",
    ai_score: 85,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    awb: "AWB-WHBAG001",
    image_urls: ["https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png"],
    product: {
      title: "Fjallraven - Foldsack No. 1 Backpack",
      image_url: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png"
    }
  },
  {
    id: "uuid-wh-dummy-2",
    status: "accepted",
    ai_routing_decision: "standard_return",
    warehouse_confirmed_at: null,
    flaws_json: {
      auto_approved: true,
      pickup_flagged: true,
      pickup_agent_notes: "Item looks worn and has a small tear not reported by AI.",
      flaws: [],
      return_photo_urls: ["https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png"]
    },
    damage_origin: null,
    ai_grade: "A",
    ai_score: 95,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    awb: "AWB-WHSHIRT2",
    image_urls: ["https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png"],
    product: {
      title: "Mens Casual Slim Fit T-Shirt",
      image_url: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png"
    }
  },
  {
    id: "uuid-wh-dummy-3",
    status: "accepted",
    ai_routing_decision: "donate",
    warehouse_confirmed_at: null,
    flaws_json: {
      seller_approved: true,
      pickup_flagged: false,
      flaws: [
        { name: "Missing Button", severity: "major", image_index: 0, x_percent: 20, y_percent: 80, width_percent: 10, height_percent: 10 }
      ],
      return_photo_urls: ["https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png"]
    },
    damage_origin: "transit_damage",
    ai_grade: "C",
    ai_score: 55,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    awb: "AWB-WHJACKET",
    image_urls: ["https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png"],
    product: {
      title: "Mens Cotton Jacket",
      image_url: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png"
    }
  },
  {
    id: "uuid-wh-dummy-4",
    status: "accepted",
    ai_routing_decision: "standard_return",
    warehouse_confirmed_at: null,
    flaws_json: {
      auto_approved: true,
      pickup_flagged: false,
      flaws: [],
      return_photo_urls: ["https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png"]
    },
    damage_origin: null,
    ai_grade: "A",
    ai_score: 100,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    awb: "AWB-WHCOAT04",
    image_urls: ["https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png"],
    product: {
      title: "Womens Winter Coat",
      image_url: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png"
    }
  },
  {
    id: "uuid-wh-dummy-5",
    status: "accepted",
    ai_routing_decision: "relist_as_refurbished",
    warehouse_confirmed_at: null,
    flaws_json: {
      seller_approved: true,
      pickup_flagged: true,
      pickup_agent_notes: "Stain looks darker in person, might need cleaning before relist.",
      flaws: [
        { name: "Sleeve Stain", severity: "minor", image_index: 0, x_percent: 80, y_percent: 50, width_percent: 10, height_percent: 10 }
      ],
      return_photo_urls: ["https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png"]
    },
    damage_origin: "consumer_usage",
    ai_grade: "B",
    ai_score: 78,
    created_at: new Date(Date.now() - 18000000).toISOString(),
    awb: "AWB-WHTEE005",
    image_urls: ["https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png"],
    product: {
      title: "Womens Short Sleeve T-Shirt",
      image_url: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png"
    }
  },
  {
    id: "uuid-wh-dummy-6",
    status: "accepted",
    ai_routing_decision: "relist_as_refurbished",
    warehouse_confirmed_at: null,
    flaws_json: {
      auto_approved: true,
      pickup_flagged: false,
      flaws: [
        { name: "Micro-scratches", severity: "moderate", image_index: 0, x_percent: 50, y_percent: 50, width_percent: 25, height_percent: 25 }
      ],
      return_photo_urls: ["https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png"]
    },
    damage_origin: "manufacturing_defect",
    ai_grade: "B",
    ai_score: 80,
    created_at: new Date(Date.now() - 21600000).toISOString(),
    awb: "AWB-WHRING06",
    image_urls: ["https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png"],
    product: {
      title: "Solid Gold Petite Micropave Ring",
      image_url: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png"
    }
  }
];

export default function WarehouseQueuePage() {
  const [rows, setRows] = useState<WarehouseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "escalated">("pending");
  const [isScannerOpen, setIsScannerOpen] = useState(false);


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
        awb: `AWB-${row.id.substring(0, 8).toUpperCase()}`,
        image_urls: row.return_photo_urls || [],
        product: Array.isArray(row.products) ? row.products[0] : row.products,
      }));

      if (data) {
        const filtered = mappedData.filter(r => {
           const decision = r.ai_routing_decision || "";
           return !decision.includes("keep");
        });
        
        // Always prepend dummy data to show the UI demo, while keeping DB items
        setRows([...DUMMY_WAREHOUSE_QUEUE, ...filtered]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error fetching warehouse queue data:", err);
      setError(err?.message || "Failed to load the warehouse queue.");
      setRows(DUMMY_WAREHOUSE_QUEUE);
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
        if (target.ai_routing_decision === "donate" || target.ai_routing_decision === "recycle") {
          updatePayload.status = "completed";
        }
      } else if (action === "fraud") {
        updatePayload = {
          status: "inspected", // Put it in escalated queue
          flaws_json: { ...target.flaws_json, auto_approved: false, warehouse_override: "fraud" }
        };
      } else if (action === "downgrade") {
        updatePayload = {
          ai_routing_decision: "recycle",
          flaws_json: { ...target.flaws_json, warehouse_override: "downgrade" },
          warehouse_confirmed_at: new Date().toISOString()
        };
      }

      const { error: updateErr } = await supabase
        .from("returns")
        .update(updatePayload)
        .eq("id", returnId);

      if (updateErr) {
        throw updateErr;
      }

      if ((action === "match" || !action) && target.ai_routing_decision === "relist_as_refurbished") {
        fetch('/api/relist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ returnId: returnId }),
        }).catch(err => console.error("[Warehouse] Failed to execute auto-relist:", err));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Confirmation error:", err);
      setConfirmError(err?.message || "Failed to update return.");
      // Revert optimistic update
      setRows((prev) => [...prev, target]);
    }
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
      <div className="max-w-6xl mx-auto">
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
          
          {/* Warehouse Operations Analytics Header */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col px-3 border-r border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-500" /> Avg Processing Time</span>
              <span className="text-lg font-black text-gray-800">45s <span className="text-xs font-semibold text-gray-400 line-through">3m avg</span></span>
            </div>
            <div className="flex flex-col px-3 border-r border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-500" /> Active Escalations</span>
              <span className="text-lg font-black text-gray-800">{escalatedQueueItems.length}</span>
            </div>
            <div className="flex flex-col px-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1"><Box className="w-3 h-3 text-purple-500" /> Binned Today</span>
              <span className="text-lg font-black text-gray-800">14</span>
            </div>
          </div>
        </header>

        {/* WMS Data Table Interface */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Top Control Bar: Tabs & Search */}
          <div className="border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between px-2 sm:px-0">
            
            {/* Tabs */}
            <div className="flex items-center w-full sm:w-auto px-4 pt-2 sm:pt-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "pending"
                    ? "border-blue-600 text-blue-700 bg-blue-50/30"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>Inbound Inspection</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "pending" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {physicalQueueItems.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("escalated")}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "escalated"
                    ? "border-amber-500 text-amber-700 bg-amber-50/30"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>Action Required</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "escalated" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {escalatedQueueItems.length}
                </span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="p-3 w-full sm:w-80 shrink-0 border-t sm:border-t-0 border-gray-200">
              <div className="relative flex items-center bg-white rounded-lg border border-gray-300 shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                <ScanLine className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Scan AWB / Return ID..."
                  className="w-full pl-9 pr-16 py-2.5 bg-transparent focus:outline-none text-sm text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    title="Use Camera Scanner"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>Error: {error}</p>
            </div>
          )}

          {confirmError && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>Error: {confirmError}</p>
            </div>
          )}

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Package / Item</div>
            <div className="col-span-2">AI Grade</div>
            <div className="col-span-3">Target Route</div>
            <div className="col-span-3 text-right">Action</div>
          </div>

          {/* Table Body */}
          <div className="bg-white flex-1 min-h-[400px]">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {activeTab === "pending" && (
                  <PhysicalHandlingQueueSection
                    records={physicalQueueItems}
                    onConfirm={handleConfirm}
                  />
                )}
                {activeTab === "escalated" && (
                  <EscalatedQueueSection records={escalatedQueueItems} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isScannerOpen && (
        <BarcodeScanner 
          onClose={() => setIsScannerOpen(false)} 
          onScan={(decodedText) => {
            setSearchQuery(decodedText);
            setIsScannerOpen(false);
          }} 
        />
      )}

    </main>
  );
}
