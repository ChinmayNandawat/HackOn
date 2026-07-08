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
            Auto-approved returns will appear here once they&apos;re ready to move.
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>AI Assessment & Pre-Grade Passport</span>
                </h4>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Grade {activeItem.ai_grade || "A"} • Confidence: {activeItem.ai_score || 85}%
                </span>
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
                    flaws:
                      activeItem.flaws_json?.flaws ||
                      (activeItem.flaws_json?.note
                        ? [
                            {
                              name: "Condition Note",
                              description: activeItem.flaws_json.note,
                              severity: "minor",
                            },
                          ]
                        : []),
                    return_photo_urls:
                      activeItem.image_urls ||
                      (activeItem.product?.image_url ? [activeItem.product.image_url] : []),
                  },
                } as unknown as Product}
                showFullDetail={true}
              />
            </div>

            {/* Right Column (lg:col-span-5): Full-Height Physical Check & Final Disposition Routing Console */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Physical Check & Intake Verdict
                </h4>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">AI Damage Origin:</span>
                  <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-bold">
                    {activeItem.damage_origin?.replace('_', ' ') || "None"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Target Bin:</span>
                  <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 font-bold">
                    {getDestinationLabel(activeItem.ai_routing_decision)}
                  </span>
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-800">
                Does the physical item match the AI&apos;s assessment above?
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setVerificationStatus("match")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                    verificationStatus === "match"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      verificationStatus === "match" ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <div
                      className={`font-bold text-sm ${
                        verificationStatus === "match" ? "text-emerald-950" : "text-slate-800"
                      }`}
                    >
                      Yes, Condition Matches
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        verificationStatus === "match" ? "text-emerald-800" : "text-slate-500"
                      }`}
                    >
                      The item has the exact flaws described by AI.
                    </div>
                  </div>
                </button>

                {/* Final Disposition Routing Selector */}
                {verificationStatus === "match" && (() => {
                  const currentGrade = overrideGrade || activeItem.ai_grade || "A";
                  const gradeOptionsMap: Record<string, string[]> = {
                    "A+": [
                      "⚡ Route to Amazon Dark Store (Immediate 10-Min Resale)",
                      "✨ Restock & Relist as Brand New Inventory",
                    ],
                    "A": [
                      "♻️ Relist on ReLife at 15-20% Discount",
                      "🛒 Route to Local Neighborhood Deal Showcase",
                    ],
                    "B": [
                      "🏷️ Relist on ReLife Refurbished at 25-30% Discount",
                      "🛒 Route to Local Neighborhood Deal Showcase",
                    ],
                    "C": [
                      "🔥 Deep Discount Relist on ReLife (50% Off Max)",
                      "💚 Route to NGO Community Partner",
                    ],
                    "D": [
                      "💚 Donate to NGO Partner (Functional / Usable Condition)",
                      "♻️ Route to E-Waste Component Harvesting (Broken / Unusable)",
                    ],
                  };

                  const options = gradeOptionsMap[currentGrade] || gradeOptionsMap["A"];

                  return (
                    <div className="mt-3 bg-white border border-emerald-200 rounded-2xl p-4 space-y-3.5 shadow-xs animate-in fade-in duration-200">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Select & Confirm Final Route for Grade {currentGrade}:</span>
                          </span>
                        </div>

                        {/* Interactive Grade Tier Switcher for Hub Worker / Live Demo */}
                        <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                          <span className="text-[10px] font-bold text-gray-500 uppercase px-1">Grade:</span>
                          {(["A+", "A", "B", "C", "D"] as const).map((gradeTier) => (
                            <button
                              key={gradeTier}
                              type="button"
                              onClick={() => {
                                setOverrideGrade(gradeTier);
                                setSelectedRoute(null);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                                currentGrade === gradeTier
                                  ? "bg-emerald-600 text-white shadow-2xs"
                                  : "bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200/60"
                              }`}
                            >
                              {gradeTier}
                            </button>
                          ))}
                        </div>
                      </div>

                      {currentGrade === "D" && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                          💡 <strong>Hub Employee Guidance:</strong> Inspect item condition. Select NGO donation if the product is functional/useful for community partners; otherwise route to E-Waste Harvesting.
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2">
                        {options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSelectedRoute(option)}
                            className={`p-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border ${
                              selectedRoute === option
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white hover:bg-emerald-50/50 hover:border-emerald-300 text-gray-800 border-gray-200"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      {routingSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-extrabold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{routingSuccess}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={!selectedRoute}
                        onClick={() => {
                          if (!selectedRoute) return;
                          setRoutingSuccess(`✅ BINNED TO DESTINATION (${currentGrade}): Route confirmed and inventory updated.`);
                          setTimeout(() => {
                            handleConfirmClick(activeItem.id);
                          }, 1200);
                        }}
                        className={`w-full py-3 font-bold rounded-xl text-sm transition-all shadow-xs ${
                          selectedRoute
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        🚀 Confirm & Execute Routing Decision
                      </button>
                    </div>
                  );
                })()}

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Overrides
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setVerificationStatus("fraud")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                    verificationStatus === "fraud"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-red-200 hover:bg-slate-50"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      verificationStatus === "fraud" ? "text-red-600" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <div
                      className={`font-bold text-sm ${
                        verificationStatus === "fraud" ? "text-red-900" : "text-slate-800"
                      }`}
                    >
                      Fraud (Wrong Item / Empty Box)
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        verificationStatus === "fraud" ? "text-red-700" : "text-slate-500"
                      }`}
                    >
                      Halt refund. Route to Quarantine.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVerificationStatus("downgrade")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                    verificationStatus === "downgrade"
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-amber-200 hover:bg-slate-50"
                  }`}
                >
                  <ShieldAlert
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      verificationStatus === "downgrade" ? "text-amber-600" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <div
                      className={`font-bold text-sm ${
                        verificationStatus === "downgrade" ? "text-amber-900" : "text-slate-800"
                      }`}
                    >
                      Condition Worse Than Expected
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        verificationStatus === "downgrade" ? "text-amber-700" : "text-slate-500"
                      }`}
                    >
                      AI missed major damage. Downgrade to Scrap/Liquidation.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Full-Width Sticky Footer Bar */}
          <div className="sticky bottom-0 z-20 bg-slate-50 border-t border-slate-200 px-6 md:px-10 py-4 flex justify-end items-center gap-3 mt-auto">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!verificationStatus}
              onClick={() => handleConfirmClick(activeItem.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer ${
                !verificationStatus
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : verificationStatus === "match"
                  ? "bg-emerald-900 text-white hover:bg-emerald-800"
                  : verificationStatus === "fraud"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {verificationStatus === "match"
                ? `Confirm Move to: ${getDestinationLabel(activeItem.ai_routing_decision)}`
                : verificationStatus === "fraud"
                ? "Submit to Quarantine"
                : verificationStatus === "downgrade"
                ? "Downgrade & Reroute"
                : "Select an option"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
