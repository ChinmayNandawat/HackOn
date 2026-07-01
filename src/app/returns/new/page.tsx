"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Truck, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  QrCode,
  UserCheck,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewReturnPage() {
  const router = useRouter();
  
  // Step State (1: Reason & Item, 2: Quick Condition Check, 3: Instant Driver Return)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [comments, setComments] = useState("");
  
  // AI Vision Simulation State
  const [visionScanning, setVisionScanning] = useState(false);
  const [visionProgress, setVisionProgress] = useState(0);
  const [visionCompleted, setVisionCompleted] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const returnReasonsList = [
    "Size or fit slightly off",
    "Item defective or doesn't work",
    "No longer needed / Changed mind",
    "Inaccurate website description or photos",
    "Better deal found elsewhere",
    "Package arrived damaged in transit"
  ];

  // Load products to select
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("orders")
        .select("*, products(*)")
        .eq("buyer_id", "00000000-0000-0000-0000-000000000002")
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        const orderedProducts = data
          .map((order: any) => Array.isArray(order.products) ? order.products[0] : order.products)
          .filter(Boolean);
          
        const uniqueProducts: any[] = [];
        const seenIds = new Set();
        for (const p of orderedProducts) {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            uniqueProducts.push(p);
          }
        }
        setProducts(uniqueProducts);
      }
      setLoadingProducts(false);
      
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const pid = params.get("productId");
        if (pid) {
          setSelectedProductId(pid);
        }
      }
    }
    loadProducts();
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const startAIVisionScan = () => {
    setVisionScanning(true);
    setVisionProgress(0);
    setVisionCompleted(false);

    const interval = setInterval(() => {
      setVisionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setVisionScanning(false);
          setVisionCompleted(true);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    
    try {
      const { data: insertData, error: insertError } = await supabase.from("returns").insert({
        buyer_id: "00000000-0000-0000-0000-000000000002",
        product_id: selectedProductId,
        status: "processing",
        reason: `${returnReason}${comments ? ` — ${comments}` : ""}`,
        return_photo_urls: [selectedProduct?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
      }).select("id").single();
      
      if (insertError) throw insertError;
      if (!insertData || !insertData.id) throw new Error("Failed to retrieve new return ID.");
      
      const processRes = await fetch("/api/process-return-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId: insertData.id }),
      });

      if (!processRes.ok) {
        console.warn("AI processing warning:", await processRes.text());
      }
      
      router.push("/returns/success");
      
    } catch (err: any) {
      console.error("Submit Error:", err);
      setSubmitError(err.message || "Failed to submit return request.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Clean SaaS Header */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400 font-bold text-xs border border-teal-200/60 dark:border-teal-800/50 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Resolution Wizard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Effortless 3-Step Return Flow
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Complete condition verification to unlock immediate doorstep driver hand-back & instant refunds.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-4 rounded-xl text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Speed Guarantee</span>
            <span className="text-[#0F766E] dark:text-teal-400 font-black text-lg flex items-center gap-1 justify-end mt-0.5">
              <Zap className="w-4 h-4 fill-current" />
              <span>&lt; 60 Seconds</span>
            </span>
          </div>
        </div>

        {/* 3-Step Wizard Indicator Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            step === 1 ? "bg-[#0F766E] text-white shadow-2xs" : step > 1 ? "bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-300 border border-teal-200/60 dark:border-teal-800" : "text-slate-400 bg-slate-50 dark:bg-slate-800"
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-black ${step === 1 ? "bg-white text-[#0F766E]" : step > 1 ? "bg-[#0F766E] text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
              {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
            </span>
            <span className="truncate">1. Reason & Item</span>
          </div>

          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            step === 2 ? "bg-[#0F766E] text-white shadow-2xs" : step > 2 ? "bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-300 border border-teal-200/60 dark:border-teal-800" : "text-slate-400 bg-slate-50 dark:bg-slate-800"
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-black ${step === 2 ? "bg-white text-[#0F766E]" : step > 2 ? "bg-[#0F766E] text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
              {step > 2 ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
            </span>
            <span className="truncate">2. Condition Check</span>
          </div>

          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            step === 3 ? "bg-[#0F766E] text-white shadow-2xs" : "text-slate-400 bg-slate-50 dark:bg-slate-800"
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-black ${step === 3 ? "bg-white text-[#0F766E]" : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
              3
            </span>
            <span className="truncate">3. Instant Driver Hand-back</span>
          </div>
        </div>

        {/* Wizard Card Body */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          
          {/* STEP 1: Product Selection & Interactive Reason Pills */}
          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Step 1: Select Item & Return Reason</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tell us why you are returning this item so we can route it directly to our circular feed.</p>
                </div>
                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">Step 1 of 3</Badge>
              </div>
              
              <div className="space-y-4">
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  1. Which order item are you returning?
                </label>
                
                {loadingProducts ? (
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                ) : (
                  <select 
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none font-bold text-sm text-slate-900 dark:text-white shadow-2xs cursor-pointer transition"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- Choose an eligible order item --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title} (₹{(p.original_price || 14500).toLocaleString("en-IN")})</option>
                    ))}
                  </select>
                )}

                {/* Selected Item Preview Card */}
                {selectedProduct && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 shrink-0 flex items-center justify-center">
                      <img src={selectedProduct.image_url} alt={selectedProduct.title} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded uppercase">Eligible for Instant Resolution</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1 line-clamp-1">{selectedProduct.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Original Deal Value: ₹{(selectedProduct.original_price || 14500).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 pt-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  2. Why are you returning this item? (Select reason)
                </label>
                
                {/* Interactive Selectable Pills instead of Clunky Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {returnReasonsList.map((reason) => {
                    const isSelected = returnReason === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setReturnReason(reason)}
                        className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-teal-50 dark:bg-teal-950/60 border-[#0F766E] dark:border-teal-500 text-[#0F766E] dark:text-teal-300 shadow-2xs ring-1 ring-[#0F766E]"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                        }`}
                      >
                        <span>{reason}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0 text-[#0F766E] dark:text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Additional Condition Notes (Optional)
                </label>
                <textarea 
                  rows={2}
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#0F766E] outline-none text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-white"
                  placeholder="e.g., Tried on once, tags still attached, box intact..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => { setStep(2); startAIVisionScan(); }}
                  disabled={!selectedProductId || !returnReason}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-sm sm:text-base rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue to Step 2: Quick Condition Check</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
          
          {/* STEP 2: Quick Condition Check with Clean AI Verification Marks */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
                    <span>Step 2: Quick Condition Check</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Our neural computer vision verifies item condition in real-time so you don&apos;t have to wait for warehouse inspection.</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-[#0F766E] dark:text-teal-400 hover:underline font-bold">➔ Change Item</button>
              </div>

              {/* Clean Viewfinder Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-inner relative overflow-hidden min-h-[340px] flex flex-col justify-between">
                
                <div className="relative z-10 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">AI-VISION-ENG-v4 • ACTIVE SCAN</span>
                  </div>
                  <Badge className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">100-Point Neural Matrix</Badge>
                </div>

                {/* Product Thumbnail with Clean Verification Badges */}
                <div className="relative my-6 flex items-center justify-center min-h-[200px]">
                  <div className="w-48 sm:w-56 h-48 sm:h-56 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 relative flex items-center justify-center shadow-md">
                    <img 
                      src={selectedProduct?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"} 
                      alt="Scanning Product" 
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 scale-105" 
                    />

                    {/* Clean Verification Badge 1 */}
                    {visionProgress >= 25 && (
                      <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg text-[10px] text-[#0F766E] dark:text-teal-300 font-bold shadow-sm animate-in zoom-in-50 duration-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#0F766E] dark:text-teal-400 shrink-0" />
                        <span>📦 Housing: 99% Intact</span>
                      </div>
                    )}

                    {/* Clean Verification Badge 2 */}
                    {visionProgress >= 50 && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/90 dark:bg-slate-900/90 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg text-[10px] text-[#0F766E] dark:text-teal-300 font-bold shadow-sm animate-in zoom-in-50 duration-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#0F766E] dark:text-teal-400 shrink-0" />
                        <span>✨ Surface: Flawless Grade A</span>
                      </div>
                    )}

                    {/* Clean Verification Badge 3 */}
                    {visionProgress >= 75 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg text-[10px] text-[#0F766E] dark:text-teal-300 font-bold shadow-sm animate-in zoom-in-50 duration-300 flex items-center gap-1 whitespace-nowrap">
                        <Zap className="w-3 h-3 text-[#0F766E] dark:text-teal-400 shrink-0" />
                        <span>⚡ Barcode Verified • Circular Feed Ready</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Status Footer */}
                <div className="relative z-10 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">
                      {visionScanning ? "Running 100-Point Neural Inspection..." : "✅ Inspection Passed • Flawless Condition Confirmed"}
                    </span>
                    <span className="text-[#0F766E] dark:text-teal-400 font-black">{visionProgress}%</span>
                  </div>
                  
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-[#0F766E] rounded-full transition-all duration-300"
                      style={{ width: `${visionProgress}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {visionCompleted && (
                <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-3 duration-300">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-[#0F766E] dark:text-teal-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">AI Condition Check Passed!</h4>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Your item qualifies for instant driver hand-back & immediate refund override.</p>
                    </div>
                  </div>
                  <Badge className="bg-[#0F766E] text-white font-bold text-xs px-3 py-1">Grade A Verified</Badge>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                <button onClick={startAIVisionScan} className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer">
                  ↻ Re-run Condition Scan
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!visionCompleted}
                  className="px-8 py-4 bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-sm sm:text-base rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue to Step 3: Instant Driver Return</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
          
          {/* STEP 3: Instant Driver Return Notice & Resolution */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Truck className="w-6 h-6 text-[#0F766E] dark:text-teal-400" />
                    <span>Step 3: ⚡ Instant Driver Return</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Because you are a verified Prime buyer with AI-verified condition, your refund is guaranteed immediately.</p>
                </div>
                <Badge className="bg-teal-50 dark:bg-teal-950/80 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs px-3 py-1">Zero Wait Guarantee</Badge>
              </div>

              {/* Friendly Conversational Notice Banner */}
              <div className="bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#0F766E] text-white rounded-lg shadow-2xs">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Good news! Your delivery driver is still nearby.
                  </h3>
                </div>
                
                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                  Hand it back within <strong className="text-[#0F766E] dark:text-teal-300 font-black">15 minutes</strong> for an immediate refund. No shipping labels, no box taping, and zero return depot delays.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-teal-200/60 dark:border-teal-800/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <UserCheck className="w-4 h-4 text-[#0F766E]" />
                    <span>Courier Assigned: <strong className="text-slate-900 dark:text-white">Ramesh K. • DL 1CA 4921</strong> (Notified)</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Instant Refund Value</span>
                    <span className="text-xl font-black text-[#0F766E] dark:text-teal-300">
                      ₹{(selectedProduct?.original_price || 14500).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Step Doorstep Instructions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white font-black text-xs flex items-center justify-center">1</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#0F766E]" />
                    <span>Driver En Route</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Driver will ring your doorbell. Have the item ready in original packaging.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white font-black text-xs flex items-center justify-center">2</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#0F766E]" />
                    <span>Scan & Hand-back</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Show your return QR code <strong className="text-slate-900 dark:text-white font-bold">#RN-89214</strong>. Driver scans to verify hand-over.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white font-black text-xs flex items-center justify-center">3</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0F766E]" />
                    <span>Instant Credit</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Full refund credited to your <strong className="text-slate-900 dark:text-white font-bold">Bank Account</strong> within 60 seconds + 50 Green Credits!
                  </p>
                </div>
              </div>
              
              {submitError && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}
              
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer">
                  ➔ Back to Condition Review
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 py-5 bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-base rounded-xl disabled:opacity-50 flex justify-center items-center gap-2.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Dispatching Driver & Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-current" />
                      <span>Confirm Driver Hand-back & Trigger Instant Refund</span>
                    </>
                  )}
                </button>
              </div>
              
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}
