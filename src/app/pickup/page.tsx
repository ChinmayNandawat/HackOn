"use client";

import React, { useState } from "react";
import {
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  XCircle,
  Truck,
  Tag,
  RefreshCw,
  X,
  ScanLine
} from "lucide-react";

export default function PickupAgentTerminalPage() {
  const [searchQuery, setSearchQuery] = useState("AWB-528C72D4");
  const [activePackageLoaded, setActivePackageLoaded] = useState(true);
  const [verdict, setVerdict] = useState<"accept" | "reject" | null>(null);
  const [isCameraScanOpen, setIsCameraScanOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handlePresetLoad = () => {
    setSearchQuery("AWB-528C72D4");
    setActivePackageLoaded(true);
    setVerdict(null);
  };

  const handleSimulateCameraScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsCameraScanOpen(false);
      setSearchQuery("AWB-528C72D4");
      setActivePackageLoaded(true);
      setVerdict(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Doorstep Intake Terminal • Amazon EasyShip Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              🚚 Amazon EasyShip — Doorstep Return Intake & Field Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time AI condition grading, customer trust verification & doorstep decision console.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200">
              Agent ID: #ES-DEL-884
            </span>
          </div>
        </div>

        {/* Section 1: Search & Interactive Barcode Scanner Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan Return AWB Barcode or Order ID at Doorstep..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-all shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsCameraScanOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Scan Package Barcode</span>
            </button>
          </div>

          {/* Demo Barcode Preset Pill */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Preset Doorstep Label:
            </span>
            <button
              type="button"
              onClick={handlePresetLoad}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-800 transition-all cursor-pointer shadow-2xs"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>🏷️ Load Doorstep Package: AWB-528C72D4 — Arctic Fox Transparent Mouse</span>
            </button>
          </div>
        </div>

        {/* Section 2: 3-Column Doorstep Decision Console */}
        {activePackageLoaded && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Column 1: AI Condition Passport & Bounding-Box Evidence */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  🤖 ReLife AI Pre-Pickup Grading
                </h2>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  AWB-528C72D4
                </span>
              </div>

              {/* Product Summary */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    Arctic Fox Pureview Transparent Mouse
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Dual Mode Wireless • Transparent Housing</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block font-medium">Price</span>
                  <span className="text-sm font-extrabold text-emerald-700">₹600</span>
                </div>
              </div>

              {/* AI Grade Badge */}
              <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-xl text-xs font-bold">
                <span>AI Pre-Grade:</span>
                <span className="font-extrabold text-emerald-900">
                  Grade B (75/100) — Confidence: HIGH (94%)
                </span>
              </div>

              {/* Outlined Photo Box with Visual AI Bounding-Box Tags */}
              <div className="relative rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center">
                <img
                  src="https://m.media-amazon.com/images/I/41zsXOJslQL._SX342_SY445_QL70_FMwebp_.jpg"
                  alt="Arctic Fox Pureview Transparent Mouse AI Scan"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Visual AI Bounding-Box Overlay */}
                <div className="absolute top-1/4 right-8 w-28 h-20 border-2 border-amber-400 border-dashed rounded-lg bg-amber-400/15 animate-pulse" />
                <div className="absolute top-3 left-3 bg-amber-500/90 text-white font-extrabold text-[11px] px-3 py-1 rounded-lg shadow-lg backdrop-blur-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>scratch on clear cover — MINOR</span>
                </div>
              </div>

              {/* Doorstep Checklist */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 space-y-2.5">
                <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
                  Doorstep Agent Inspection Checklist
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">✓ Verify item matches Arctic Fox transparent housing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">✓ Verify USB receiver dongle is inside</span>
                </div>
              </div>
            </div>

            {/* Column 2: Buyer Trust Score & Return History Analytics */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  🛡️ Customer Return Risk & Trust Score
                </h2>
              </div>

              {/* Trust Gauge Card */}
              <div className="bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border border-emerald-300/80 rounded-2xl p-6 text-center space-y-2.5 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Buyer Reliability Rating
                </div>
                <div className="text-emerald-700 font-extrabold text-4xl tracking-tight">
                  92 / 100
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-900 text-white px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>VERIFIED PRIME TRUST</span>
                  </span>
                </div>
              </div>

              {/* Analytics List */}
              <div className="space-y-4 text-xs text-slate-700 pt-1">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-500">Account Standing:</span>
                  <span className="font-extrabold text-slate-900">3 Years Prime Member (Mumbai)</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-500">Order History:</span>
                  <span className="font-extrabold text-slate-900">48 Orders Placed | Only 2 Returns (95.8% Keep Rate)</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-500">Return Velocity:</span>
                  <span className="font-extrabold text-slate-900">Return initiated on Day 2 of 7-day window</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="font-medium text-slate-500">Fraud Risk Assessment:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    LOW RISK — Fast-Track Refund Eligible
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Doorstep Agent Decision Console */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  ⚡ Field Verification Action
                </h2>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Perform open-box check and select intake verdict:
              </p>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => setVerdict("accept")}
                  className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>✅ Verify & Accept Return — Route to FC Dock</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerdict("reject")}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>🚨 Reject Pickup — Wrong Item / COD Swap Detected</span>
                </button>
              </div>

              {/* Dynamic Live Banner based on Verdict */}
              {verdict === "accept" && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs space-y-1.5 animate-in fade-in duration-200">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✅ Intake Confirmed! Box routed to Amazon Now Dark Store #404. Buyer refund fast-tracked.</span>
                  </div>
                </div>
              )}

              {verdict === "reject" && (
                <div className="bg-red-50 border border-red-300 text-red-900 p-4 rounded-2xl text-xs space-y-1.5 animate-in fade-in duration-200">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>🚨 Pickup Rejected: Counterfeit/Item Swap logged. Customer support notified & return cancelled.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doorstep Barcode Camera Scan Simulation Modal */}
        {isCameraScanOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    📷 Doorstep Package Barcode Scanner
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Align return shipping label inside the viewfinder box
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraScanOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex flex-col items-center justify-center border-2 border-slate-800">
                <div className="absolute inset-6 border-2 border-emerald-400/80 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                  {isScanning ? (
                    <div className="text-emerald-400 font-extrabold text-xs bg-slate-900/90 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Decoding Return Barcode...</span>
                    </div>
                  ) : (
                    <div className="text-emerald-400/90 font-bold text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg">
                      Ready to Scan • AWB-528C72D4
                    </div>
                  )}
                </div>

                {/* Animated Scanner Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse" />
              </div>

              <button
                type="button"
                onClick={handleSimulateCameraScan}
                disabled={isScanning}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <ScanLine className="w-4 h-4" />
                <span>{isScanning ? "Scanning Label..." : "Simulate Live Barcode Scan"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
