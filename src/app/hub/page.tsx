"use client";

import { useState } from "react";
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Box, 
  Barcode, 
  Sparkles, 
  ArrowRight, 
  X,
  Scan,
  Scale,
  RefreshCw,
  ShieldCheck,
  Cpu,
  RotateCcw
} from "lucide-react";

interface MockDockItem {
  id: string;
  title: string;
  reason: string;
  status: string;
  sku: string;
  category: string;
  price: string;
  catalogImg: string;
  buyerImg: string;
  dockImgAuthentic: string;
  dockImgFraud: string;
  buyerNote: string;
}

const MOCK_ITEMS: MockDockItem[] = [
  {
    id: "AMZ-IN-882194",
    title: "Nike Air Zoom Running Shoes (Size 9)",
    reason: "Size too small / Box opened",
    status: "Waiting Dock Scan",
    sku: "#NK-ZOOM-09",
    category: "Footwear",
    price: "₹8,499",
    catalogImg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    buyerImg: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
    dockImgAuthentic: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80",
    dockImgFraud: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80",
    buyerNote: "Box opened, shoe pristine",
  },
  {
    id: "AMZ-IN-991023",
    title: "Sony WH-1000XM5 Wireless Headphones",
    reason: "Defective audio",
    status: "Waiting Dock Scan",
    sku: "#SNY-XM5-BLK",
    category: "Electronics",
    price: "₹29,990",
    catalogImg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    buyerImg: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    dockImgAuthentic: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80",
    dockImgFraud: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=600&auto=format&fit=crop&q=80",
    buyerNote: "Left ear cup slight crackle",
  }
];

export default function HubEmployeePage() {
  const [selectedItem, setSelectedItem] = useState<MockDockItem | null>(null);
  const [step, setStep] = useState<'capture' | 'analyzing' | 'result'>('capture');
  const [isFraudSimulated, setIsFraudSimulated] = useState(false);
  const [processedIds, setProcessedIds] = useState<string[]>([]);

  const handleLaunchScan = (item: MockDockItem) => {
    setSelectedItem(item);
    setStep('capture');
    setIsFraudSimulated(false);
  };

  const handleRunAudit = () => {
    setStep('analyzing');
    setTimeout(() => {
      setStep('result');
    }, 1200);
  };

  const handleCompleteIntake = () => {
    if (selectedItem && !processedIds.includes(selectedItem.id)) {
      setProcessedIds([...processedIds, selectedItem.id]);
    }
    setSelectedItem(null);
  };

  return (
    <div className="min-h-[85vh] py-6 space-y-8 animate-fadeIn font-sans text-gray-900">
      {/* Header Section - Classy White Theme */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Scan className="w-3.5 h-3.5" />
            <span>Fulfillment Center Dock #IN-HYD4</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3 flex-wrap">
            <span>🏭 Amazon FBA Fulfillment Center Dock — AI Intake & Reconciliation Station</span>
          </h1>
          
          <p className="text-sm text-gray-600 max-w-3xl leading-relaxed font-medium">
            Physical dock scanning station. AWS Bedrock Nova Pro automatically reconciles incoming boxes against seller catalog data and buyer return claims.
          </p>
        </div>
      </div>

      {/* Dock Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-900">Incoming Dock Queue</h2>
            <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {MOCK_ITEMS.length - processedIds.length} Pending
            </span>
          </div>
          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-600" />
            AWS Bedrock Optical AI: Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_ITEMS.map((item) => {
            const isDone = processedIds.includes(item.id);
            return (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs flex flex-col justify-between ${
                  isDone 
                    ? "border-emerald-200 bg-emerald-50/30 opacity-75" 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                      Order #{item.id}
                    </span>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      isDone 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}>
                      {isDone ? "✅ Reconciled & Routed" : item.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={item.catalogImg} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-gray-900 text-base leading-snug truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">
                        SKU: <span className="font-mono text-gray-700">{item.sku}</span> • {item.price}
                      </p>
                      <div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-600 font-medium italic">
                        "{item.reason}"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                  {isDone ? (
                    <button 
                      onClick={() => handleLaunchScan(item)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer"
                    >
                      <span>Review Reconciliation Audit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLaunchScan(item)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm group active:scale-[0.98]"
                    >
                      <Camera className="w-4 h-4 text-slate-300" />
                      <span>📸 Launch Dock Reconciliation Scan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task 3: The 4-Way AI Reconciliation Modal - Classy White Theme */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-900/50 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-gray-900 flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-200">
                  <Scan className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 tracking-tight flex items-center gap-2">
                    <span>4-Way AI Reconciliation Station</span>
                    <span className="text-xs font-mono bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-700 border border-gray-200">
                      Order #{selectedItem.id}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    AWS Bedrock multimodal optical sensor verifying item integrity at intake dock.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* STEP 1: Simulated Camera Capture */}
              {step === 'capture' && (
                <div className="space-y-6 py-4 animate-fadeIn">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {/* Viewfinder simulation */}
                    <div className="w-full max-w-sm h-48 bg-gray-900 rounded-xl border border-gray-300 relative overflow-hidden flex items-center justify-center shadow-inner mb-6">
                      <img src={selectedItem.catalogImg} alt="Scanning" className="w-full h-full object-cover opacity-60 scale-105 filter contrast-125" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/50" />
                      
                      {/* Scanning targeting frame */}
                      <div className="absolute inset-4 border border-blue-400/80 rounded-lg flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                        <span className="bg-white/90 text-gray-900 text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                          DOCK OPTICAL SENSOR READY
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-md">
                      <h4 className="font-black text-lg text-gray-900">Overhead Dock Scanner Aligned</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Item barcode <span className="font-mono text-gray-900 font-bold">{selectedItem.sku}</span> detected on FC scale. Weight registered: <span className="font-mono text-emerald-700 font-bold">418g</span>. Ready for Bedrock Multimodal Audit.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleRunAudit}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2.5 text-sm group active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                      <span>⚡ Run AWS Bedrock 4-Way Reconciliation Audit</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1.5: Analyzing Loader */}
              {step === 'analyzing' && (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
                  <div className="relative">
                    <div className="w-12 h-12 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                    <Cpu className="w-5 h-5 text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h4 className="font-black text-lg text-gray-900">Reconciling 4-Way Data Matrix...</h4>
                  <p className="text-xs text-gray-500 font-mono max-w-sm">
                    Cross-referencing SKU Catalog baseline against Buyer photo claim, FC optical dock intake, and package weight metrics.
                  </p>
                </div>
              )}

              {/* STEP 2 & 3: Comparison Grid and Result Card */}
              {step === 'result' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Step 2: The 3-Column Visual Comparison Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Barcode className="w-4 h-4 text-gray-700" />
                      <span>4-Way Visual & Optical Reconciliation Grid</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Column 1: Seller Catalog Baseline */}
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
                              📦 Seller Catalog Baseline
                            </span>
                            <span className="text-[10px] bg-white text-gray-600 font-mono px-2 py-0.5 rounded border border-gray-200">
                              Official SKU
                            </span>
                          </div>
                          <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-gray-200">
                            <img src={selectedItem.catalogImg} alt="Catalog Baseline" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="text-xs space-y-1 bg-white p-2.5 rounded-xl border border-gray-200">
                          <p className="font-bold text-gray-900 truncate">{selectedItem.title}</p>
                          <p className="text-gray-500 font-mono text-[11px]">SKU: {selectedItem.sku}</p>
                          <p className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                            <Scale className="w-3 h-3" /> Std Weight: 420g
                          </p>
                        </div>
                      </div>

                      {/* Column 2: Buyer Return Claim Photo */}
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
                              📱 Buyer Return Claim Photo
                            </span>
                            <span className="text-[10px] bg-white text-gray-600 font-mono px-2 py-0.5 rounded border border-gray-200">
                              App Upload
                            </span>
                          </div>
                          <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-gray-200">
                            <img src={selectedItem.buyerImg} alt="Buyer Claim" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="text-xs space-y-1 bg-white p-2.5 rounded-xl border border-gray-200">
                          <p className="font-bold text-gray-800 italic">"{selectedItem.buyerNote}"</p>
                          <p className="text-gray-500 text-[11px]">Reason: {selectedItem.reason}</p>
                          <p className="text-blue-600 font-semibold text-[11px]">Intake Match: Pending Dock Scan</p>
                        </div>
                      </div>

                      {/* Column 3: Hub Dock Intake Scan */}
                      <div className={`bg-gray-50 border rounded-2xl p-4 space-y-3 flex flex-col justify-between transition-colors ${
                        isFraudSimulated ? "border-red-300 bg-red-50/40" : "border-emerald-300 bg-emerald-50/40"
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-extrabold uppercase tracking-wider block ${
                              isFraudSimulated ? "text-red-700" : "text-emerald-800"
                            }`}>
                              🏭 Hub Dock Intake Scan
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              isFraudSimulated ? "bg-red-100 text-red-800 border-red-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}>
                              Live FC Scan
                            </span>
                          </div>
                          <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-gray-200 relative">
                            <img 
                              src={isFraudSimulated ? selectedItem.dockImgFraud : selectedItem.dockImgAuthentic} 
                              alt="Dock Scan" 
                              className="w-full h-full object-cover" 
                            />
                            <div className={`absolute bottom-2 left-2 right-2 p-1 rounded-lg text-[10px] font-mono font-bold text-center shadow-xs ${
                              isFraudSimulated ? "bg-red-700 text-white" : "bg-emerald-800 text-white"
                            }`}>
                              {isFraudSimulated ? "⚠️ ANOMALY: WEIGHT 180g (EXPECTED 420g)" : "⚡ OPTICAL MATCH: 99.8% (WEIGHT 418g)"}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs space-y-1 bg-white p-2.5 rounded-xl border border-gray-200">
                          <p className={`font-bold text-[11px] ${isFraudSimulated ? "text-red-700" : "text-emerald-800"}`}>
                            {isFraudSimulated ? "❌ Mismatch: Old Worn Sandal / Different Item" : "✅ Exact SKU Match Verified"}
                          </p>
                          <p className="text-gray-500 text-[11px]">Barcode: {selectedItem.sku} (Verified)</p>
                          <p className={`font-semibold text-[11px] ${isFraudSimulated ? "text-red-600" : "text-emerald-700"}`}>
                            {isFraudSimulated ? "Action: SAFE-T Fraud Defense Triggered" : "Action: NearDrop Quick-Commerce Resale"}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Step 3: AI Adjudication & Routing Result Card - Classy White Theme */}
                  <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isFraudSimulated
                      ? "bg-red-50/80 border-red-200 text-gray-900"
                      : "bg-emerald-50/80 border-emerald-200 text-gray-900"
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl shrink-0 ${
                        isFraudSimulated ? "bg-red-100 text-red-600 border border-red-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}>
                        {isFraudSimulated ? <ShieldAlert className="w-8 h-8 animate-bounce" /> : <CheckCircle2 className="w-8 h-8" />}
                      </div>

                      <div className="space-y-3 flex-1">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest font-bold block text-gray-500">
                            AWS Bedrock Multimodal Reconciliation Decision
                          </span>
                          <h3 className={`text-lg sm:text-xl font-black mt-0.5 ${
                            isFraudSimulated ? "text-red-800" : "text-emerald-900"
                          }`}>
                            {isFraudSimulated 
                              ? "❌ FRAUD DETECTED: COD Item Swap Attempt" 
                              : "✅ 100% Authentic Match — Zero Discrepancy Detected"}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200/80">
                          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-gray-500 block uppercase">Condition Grade Assigned:</span>
                            <span className={`text-sm font-extrabold mt-0.5 block ${
                              isFraudSimulated ? "text-red-700" : "text-gray-900"
                            }`}>
                              {isFraudSimulated ? "Grade F (Severe Fraud Risk / Item Mismatch)" : "Grade A (Pristine / Open Box)"}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-gray-500 block uppercase">Financial Reconciliation:</span>
                            <span className={`text-sm font-extrabold mt-0.5 block ${
                              isFraudSimulated ? "text-emerald-700" : "text-emerald-700"
                            }`}>
                              {isFraudSimulated ? "₹4,500 Auto-Credited to Seller Wallet" : "Zero Removal Fees Charged to Seller"}
                            </span>
                          </div>
                        </div>

                        <div className={`p-3.5 rounded-xl border text-xs font-medium leading-relaxed flex items-start gap-2.5 ${
                          isFraudSimulated 
                            ? "bg-red-100/70 border-red-200 text-red-900" 
                            : "bg-emerald-100/70 border-emerald-200 text-emerald-950"
                        }`}>
                          <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 fill-current" />
                          <div>
                            <span className="font-bold block uppercase tracking-wide text-[11px] mb-0.5">Automated Disposition Action:</span>
                            <span>
                              {isFraudSimulated
                                ? "🛡️ Auto-Exporting SAFE-T Claim Dossier — ₹4,500 credited to Seller Wallet! Physical item quarantined in FC Evidence Locker for legal audit."
                                : "⚡ NearDrop Activated: Item automatically redirected from bin storage to Amazon Now Dark Store #404 (2.8 km away) for 10-Minute quick-commerce resale. Zero removal fees charged to Seller!"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer (Step 4: Live Q&A Simulation Flex Toggle) - Classy White Theme */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {step === 'result' && (
                  <button
                    onClick={() => setIsFraudSimulated(!isFraudSimulated)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                      isFraudSimulated
                        ? "bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
                        : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                    }`}
                  >
                    {isFraudSimulated ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✅ Revert to Authentic Match (Nike Shoe)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>⚠️ Simulate COD Item Swap Fraud Case</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {step === 'result' && (
                  <button
                    onClick={() => setStep('capture')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rescan Box</span>
                  </button>
                )}
                <button
                  onClick={handleCompleteIntake}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Complete Station Intake</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
