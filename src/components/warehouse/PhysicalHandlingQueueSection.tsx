"use client";

import { useState } from "react";
import { PackageCheck, ShieldAlert, X, AlertTriangle, CheckCircle2, ChevronRight, ShieldCheck, Box } from "lucide-react";
import { WarehouseReturnRecord, getDestinationLabel } from "@/lib/warehouseQueues";
import WarehouseInspectionCard from "./WarehouseInspectionCard";
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
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routingSuccess, setRoutingSuccess] = useState<string | null>(null);
  const [overrideGrade, setOverrideGrade] = useState<string | null>(null);

  const handleConfirmClick = (returnId: string) => {
    if (!verificationStatus) return;
    setConfirmingIds((prev) => new Set(prev).add(returnId));
    onConfirm(returnId, verificationStatus);
    setActiveItem(null);
    setVerificationStatus(null);
    setSelectedRoute(null);
    setRoutingSuccess(null);
    setOverrideGrade(null);
  };

  const closeModal = () => {
    setActiveItem(null);
    setVerificationStatus(null);
    setSelectedRoute(null);
    setRoutingSuccess(null);
    setOverrideGrade(null);
  };

  return (
    <section>
      {records.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <PackageCheck className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700">
            No items pending physical handling
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Auto-approved returns will appear here once they're ready to move.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
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
                className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 md:px-8 py-5 hover:bg-blue-50/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (!isConfirming) {
                    setActiveItem(record);
                    setSelectedRoute(record.ai_routing_decision);
                    setVerificationStatus("match");
                  }
                }}
              >
                {/* Package / Item (Col 1-4) */}
                <div className="col-span-4 flex items-center gap-5">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs font-semibold uppercase">
                      {title.substring(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col gap-1">
                    <h3 className="text-sm font-extrabold text-gray-900 truncate">
                      {title}
                    </h3>
                    <div className="flex items-center gap-2">
                       {record.awb && (
                         <span className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                           {record.awb}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                {/* AI Grade (Col 5-6) */}
                <div className="col-span-2 flex flex-col gap-1">
                   <span className={`w-fit px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide uppercase ${gradeClass}`}>
                     Grade {record.ai_grade}
                   </span>
                   <span className="text-[10px] text-gray-500 font-semibold">
                     Score: {record.ai_score}/100
                   </span>
                </div>

                {/* Target Route (Col 7-9) */}
                <div className="col-span-3 flex flex-col gap-1">
                   {destinationLabel && (
                     <span className="text-xs font-bold text-gray-900">
                       {destinationLabel}
                     </span>
                   )}
                   {record.flaws_json?.pickup_flagged && (
                     <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-fit border border-amber-200">
                       <ShieldAlert className="w-3 h-3" />
                       <span>Agent Flagged (Review Needed)</span>
                     </div>
                   )}
                </div>

                {/* Action (Col 10-12) */}
                <div className="col-span-3 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 group-hover:bg-blue-600 text-gray-700 group-hover:text-white rounded-lg text-xs font-bold transition-colors">
                    Inspect & Route <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INSPECTION MODAL (FULL PAGE TERMINAL) */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in fade-in duration-200 flex flex-col">
          {/* Top Sticky Header */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 md:px-10 py-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-extrabold text-base">
                🌱
              </span>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <span>ReLife Physical Inspection — FC Disposition Terminal</span>
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-bold">
                    ID: {activeItem.id.substring(0, 8)}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {activeItem.product?.title || "Unknown Product"} • Target Bin:{" "}
                  <strong className="text-emerald-700">{getDestinationLabel(activeItem.ai_routing_decision)}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Exit Terminal</span>
            </button>
          </div>

          {/* Full-Page Workspace Body */}
          <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (lg:col-span-7): Full AI Assessment & Health Card */}
            <div className="lg:col-span-7 space-y-4">
              <WarehouseInspectionCard item={activeItem} />
            </div>

            {/* Right Column (lg:col-span-5): Execution Console */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-600" />
                  Execution Console
                </h4>
              </div>

              {(() => {
                  const currentGrade = overrideGrade || activeItem.ai_grade || "A";
                  const routingOptions = [
                    { id: "relist_as_refurbished", label: "Relist as Refurbished" },
                    { id: "standard_return", label: "Standard Return" },
                    { id: "keep_and_refund", label: "Keep & Partial Refund" },
                    { id: "donate", label: "Donate" },
                    { id: "recycle", label: "Recycle" },
                    { id: "reject", label: "Reject Return" }
                  ];

                  // Add dark store option for top-grade items
                  if (currentGrade === "A+" || currentGrade === "A") {
                    routingOptions.unshift({ 
                      id: "hyperlocal_restock", 
                      label: "Hyperlocal Restock"
                    });
                  }

                  const suggestedRouteId = activeItem.ai_routing_decision || routingOptions[0].id;
                  const currentSelectedRoute = selectedRoute || suggestedRouteId;

                  return (
                    <>
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step 1: Final Warehouse Grade</p>
                        <div className="grid grid-cols-5 gap-2">
                          {(["A+", "A", "B", "C", "D"] as const).map((g) => (
                              <button
                                key={g}
                                onClick={() => {
                                  setOverrideGrade(g);
                                  if (!selectedRoute) setSelectedRoute(suggestedRouteId);
                                  setVerificationStatus("match");
                                }}
                                className={`py-3 rounded-xl font-black text-lg transition-all border-2 ${
                                  currentGrade === g
                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                    : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"
                                }`}
                              >
                                {g}
                              </button>
                          ))}
                        </div>
                        {overrideGrade && overrideGrade !== activeItem.ai_grade && (
                            <p className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg inline-flex items-center gap-2 border border-amber-200">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span>Grade manually overridden from <strong>{activeItem.ai_grade}</strong> to <strong>{overrideGrade}</strong></span>
                            </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step 2: Routing Destination</p>
                        
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                           <div className="flex items-center gap-2 mb-3">
                             <CheckCircle2 className="w-4 h-4 text-blue-600" />
                             <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">System / Seller Authorized Route</span>
                           </div>
                           <button
                             onClick={() => { setSelectedRoute(suggestedRouteId); setVerificationStatus("match"); }}
                             className={`w-full p-4 rounded-xl text-left font-bold transition-all border-2 ${
                               currentSelectedRoute === suggestedRouteId
                                 ? "border-blue-500 bg-white text-blue-900 shadow-sm"
                                 : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-white"
                             }`}
                           >
                             {routingOptions.find(o => o.id === suggestedRouteId)?.label || suggestedRouteId}
                           </button>
                        </div>

                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Manual Overrides</span>
                          <div className="grid grid-cols-2 gap-2">
                            {routingOptions.filter(opt => opt.id !== suggestedRouteId).map(opt => {
                              const isHyperlocal = opt.id === "hyperlocal_restock";
                              const isSelected = currentSelectedRoute === opt.id;

                              let baseStyle = "";
                              if (isHyperlocal) {
                                baseStyle = isSelected
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100";
                              } else {
                                baseStyle = isSelected
                                  ? "border-amber-500 bg-amber-50 text-amber-800"
                                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-600";
                              }

                              return (
                                <button
                                    key={opt.id}
                                    onClick={() => { setSelectedRoute(opt.id); setVerificationStatus("match"); }}
                                    className={`w-full p-3 rounded-xl text-left transition-all border-2 flex flex-col justify-center min-h-[3.5rem] ${baseStyle}`}
                                >
                                  {isHyperlocal && (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                      <Box className="w-3 h-3" />
                                      NearDrop Eligible
                                    </span>
                                  )}
                                  <div className="flex items-center justify-between w-full">
                                    <span className={`text-xs font-bold ${isHyperlocal ? 'text-sm' : ''}`}>
                                      {opt.label}
                                    </span>
                                    {isHyperlocal && (
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-600 text-emerald-50' : 'bg-emerald-100 text-emerald-700'}`}>
                                        2.4 mi
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        {routingSuccess && (
                          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>{routingSuccess}</span>
                          </div>
                        )}
                        <button
                          disabled={!verificationStatus && !activeItem.ai_routing_decision && !selectedRoute}
                          onClick={() => {
                            if (verificationStatus === "match" || (!verificationStatus && (selectedRoute || activeItem.ai_routing_decision))) {
                              setVerificationStatus("match");
                              setRoutingSuccess(`Route confirmed and inventory updated.`);
                              setTimeout(() => handleConfirmClick(activeItem.id), 1200);
                            } else {
                              handleConfirmClick(activeItem.id);
                            }
                          }}
                          className={`w-full py-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-sm ${
                              currentSelectedRoute 
                                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          Confirm & Execute Route
                        </button>
                      </div>
                    </>
                  );
              })()}
            </div>
          </div>

          {/* Full-Width Sticky Footer Bar */}
          <div className="sticky bottom-0 z-20 bg-gray-50 border-t border-gray-200 px-6 md:px-10 py-4 flex justify-between items-center mt-auto">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition cursor-pointer flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel Assessment
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
