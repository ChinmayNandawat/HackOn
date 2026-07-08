"use client";

import { useState } from "react";
import { PackageCheck, ShieldAlert, X, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { WarehouseReturnRecord, getDestinationLabel } from "@/lib/warehouseQueues";
import ProductHealthCard from "@/components/ProductHealthCard";
import { Product } from "@/types/database";

/**
 * A `WarehouseReturnRecord` enriched with the product/grading display fields the
 * Physical_Handling_Queue needs to render.
 */
export interface PhysicalHandlingQueueItem extends WarehouseReturnRecord {
  ai_grade: string | null;
  ai_score: number | null;
  awb?: string;
  created_at?: string;
  image_urls?: string[]; // Added for Health Card support
  product: {
    title: string;
    image_url: string | null;
  } | null;
}

interface PhysicalHandlingQueueSectionProps {
  records: PhysicalHandlingQueueItem[];
  onConfirm: (returnId: string, action: "match" | "fraud" | "downgrade") => void;
}

const gradeClasses: Record<string, string> = {
  A: "bg-emerald-50 text-emerald-700 border-emerald-200",
  B: "bg-teal-50 text-teal-700 border-teal-200",
  C: "bg-amber-50 text-amber-700 border-amber-200",
  D: "bg-red-50 text-red-700 border-red-200",
};

export default function PhysicalHandlingQueueSection({
  records,
  onConfirm,
}: PhysicalHandlingQueueSectionProps) {
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<PhysicalHandlingQueueItem | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"match" | "fraud" | "downgrade" | null>(null);

  const handleConfirmClick = (returnId: string) => {
    if (!verificationStatus) return;
    setConfirmingIds((prev) => new Set(prev).add(returnId));
    onConfirm(returnId, verificationStatus);
    setActiveItem(null);
    setVerificationStatus(null);
  };

  const closeModal = () => {
    setActiveItem(null);
    setVerificationStatus(null);
  };

  return (
    <section>
      <h2 className="text-lg font-extrabold text-gray-900 mb-3">
        Inbound Verification & Binning (FC)
      </h2>

      {records.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <PackageCheck className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700">
            No items pending physical handling
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Auto-approved returns will appear here once they're ready to move.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const title = record.product?.title || "Unknown Product";
            const imageUrl = record.product?.image_url || null;
            const destinationLabel = getDestinationLabel(record.ai_routing_decision);
            const gradeClass = record.ai_grade
              ? gradeClasses[record.ai_grade] || "bg-gray-50 text-gray-700 border-gray-200"
              : "";
            const isConfirming = confirmingIds.has(record.id);

            return (
              <div
                key={record.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => !isConfirming && setActiveItem(record)}
              >
                {/* Thumbnail */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs font-semibold uppercase">
                    {title.substring(0, 2)}
                  </div>
                )}

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-gray-800 truncate">
                        {title}
                      </h3>
                      {record.awb && (
                        <span className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                          {record.awb}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {record.ai_grade && (
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${gradeClass}`}>
                          Grade {record.ai_grade}
                        </span>
                      )}
                      {destinationLabel && (
                        <span className="px-2 py-0.5 rounded border text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
                          {destinationLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {record.damage_origin !== null && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 w-fit">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>AI Suspects: {record.damage_origin.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex-shrink-0 self-center flex items-center text-blue-600 gap-1 text-xs font-bold">
                  Inspect <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INSPECTION MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-lg font-extrabold text-gray-900">Physical Inspection</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-6">
              
              {/* Left Column: AI Health Card */}
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">AI Assessment</h4>
                <div className="pointer-events-none">
                  {/* Wrap in pointer-events-none so warehouse staff can't interact deeply if we don't want them to, though expanding images is fine. Let's allow pointer events. */}
                </div>
                <ProductHealthCard 
                  product={{
                    id: "temp",
                    title: activeItem.product?.title || "Unknown Product",
                    original_price: 0,
                    category: "Return",
                    image_url: activeItem.product?.image_url || "",
                    created_at: activeItem.created_at || new Date().toISOString(),
                    health_data: {
                      grade: activeItem.ai_grade,
                      score: activeItem.ai_score,
                      confidence: "High",
                      flaws: activeItem.flaws_json?.flaws || (activeItem.flaws_json?.note ? [{ name: "Condition Note", description: activeItem.flaws_json.note, severity: "minor" }] : []),
                      return_photo_urls: activeItem.image_urls || (activeItem.product?.image_url ? [activeItem.product.image_url] : [])
                    }
                  } as unknown as Product}
                  showFullDetail={true}
                />
              </div>

              {/* Right Column: Verification Form */}
              <div className="w-full lg:w-[380px] flex flex-col">
                <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Physical Check</h4>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-600 flex flex-col gap-2">
                    <span className="flex justify-between items-center">
                      <strong>AI Damage Origin:</strong> 
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-xs font-bold">
                        {activeItem.damage_origin?.replace('_', ' ') || "None"}
                      </span>
                    </span>
                    <span className="flex justify-between items-center">
                      <strong>Target Bin:</strong> 
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-xs font-bold">
                        {getDestinationLabel(activeItem.ai_routing_decision)}
                      </span>
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-800 mb-3">Does the physical item match the AI's assessment above?</p>
                
                <div className="space-y-3 flex-1">
                  <button
                    onClick={() => setVerificationStatus("match")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${verificationStatus === 'match' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'}`}
                  >
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 ${verificationStatus === 'match' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-bold ${verificationStatus === 'match' ? 'text-emerald-900' : 'text-gray-700'}`}>Yes, Condition Matches</div>
                      <div className={`text-xs mt-0.5 ${verificationStatus === 'match' ? 'text-emerald-700' : 'text-gray-500'}`}>The item has the exact flaws described by AI.</div>
                    </div>
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Overrides</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setVerificationStatus("fraud")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${verificationStatus === 'fraud' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'}`}
                  >
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${verificationStatus === 'fraud' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-bold ${verificationStatus === 'fraud' ? 'text-red-900' : 'text-gray-700'}`}>Fraud (Wrong Item / Empty Box)</div>
                      <div className={`text-xs mt-0.5 ${verificationStatus === 'fraud' ? 'text-red-700' : 'text-gray-500'}`}>Halt refund. Route to Quarantine.</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setVerificationStatus("downgrade")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${verificationStatus === 'downgrade' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-200 hover:bg-gray-50'}`}
                  >
                    <ShieldAlert className={`w-5 h-5 mt-0.5 ${verificationStatus === 'downgrade' ? 'text-amber-600' : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-bold ${verificationStatus === 'downgrade' ? 'text-amber-900' : 'text-gray-700'}`}>Condition Worse Than Expected</div>
                      <div className={`text-xs mt-0.5 ${verificationStatus === 'downgrade' ? 'text-amber-700' : 'text-gray-500'}`}>AI missed major damage. Downgrade to Scrap/Liquidation.</div>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                disabled={!verificationStatus}
                onClick={() => handleConfirmClick(activeItem.id)}
                className={`px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2 ${
                  !verificationStatus 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : verificationStatus === 'match'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : verificationStatus === 'fraud'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {verificationStatus === 'match' 
                  ? `Confirm Move to: ${getDestinationLabel(activeItem.ai_routing_decision)}` 
                  : verificationStatus === 'fraud' 
                    ? 'Submit to Quarantine' 
                    : verificationStatus === 'downgrade' 
                      ? 'Downgrade & Reroute' 
                      : 'Select an option'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
