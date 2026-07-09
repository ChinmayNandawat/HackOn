/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react";

export default function NewReturnPage() {
  const router = useRouter();
  
  // Step State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");

  const fastTrackReasons = [
    "Size too small / doesn't fit",
    "Don't like the colour / style",
    "Don't like fabric / texture",
    "Ordered by mistake / changed mind",
  ];

  const aiInspectionReasons = [
    "Item arrived damaged or scratched",
    "Functional defect / doesn't power on",
    "Wrong item or accessory missing",
  ];

  const allReasons = [...fastTrackReasons, ...aiInspectionReasons];
  
  const isFastTrack = fastTrackReasons.includes(returnReason);
  
  // Angle Config
  type AngleKeys = "front" | "back" | "side" | "damage";
  const angleOrder: AngleKeys[] = ["front", "back", "side", "damage"];
  const anglesConfig: Record<AngleKeys, { label: string, desc: string }> = {
    front: { label: "Front View", desc: "Full product face-on" },
    back: { label: "Back View", desc: "Flip and capture the back" },
    side: { label: "Side/Top View", desc: "Capture from above or side angle" },
    damage: { label: "Close-up", desc: "Any area with visible damage (or bottom if none)" },
  };

  // Photo State
  const [photos, setPhotos] = useState<Record<AngleKeys, {
    file?: File;
    preview?: string;
    qcStatus: "empty" | "uploading" | "checking" | "passed" | "failed";
    qcReason?: string;
    s3Url?: string;
  }>>({
    front: { qcStatus: "empty" },
    back: { qcStatus: "empty" },
    side: { qcStatus: "empty" },
    damage: { qcStatus: "empty" },
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [generatedAwb, setGeneratedAwb] = useState("");

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
        if (uniqueProducts.length > 0) {
          setProducts(uniqueProducts);
        } else {
          setProducts([
            { id: "demo-prod-1", title: "DIGIROOT iPad Pencil (2nd Gen)", category: "electronics" },
            { id: "demo-prod-2", title: "FLITE Slides for Men FL 370", category: "footwear" },
            { id: "demo-prod-3", title: "boAt Nirvana Ion ANC Pro Earbuds", category: "audio" },
          ]);
        }
      } else {
        setProducts([
          { id: "demo-prod-1", title: "DIGIROOT iPad Pencil (2nd Gen)", category: "electronics" },
          { id: "demo-prod-2", title: "FLITE Slides for Men FL 370", category: "footwear" },
          { id: "demo-prod-3", title: "boAt Nirvana Ion ANC Pro Earbuds", category: "audio" },
        ]);
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

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>, angleKey: AngleKeys) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const preview = URL.createObjectURL(file);
    setPhotos(prev => ({
      ...prev,
      [angleKey]: { file, preview, qcStatus: "uploading" }
    }));
    
    await processPhoto(file, preview, angleKey);
  };
  
  const processPhoto = async (file: File, preview: string, angleKey: AngleKeys) => {
    const updateStatus = (status: any, updates: any = {}) => {
      setPhotos(prev => ({
        ...prev,
        [angleKey]: { ...prev[angleKey], qcStatus: status, ...updates }
      }));
    };
    
    try {
      const presignRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      if (!presignRes.ok) throw new Error("Failed to get presigned URL");
      
      const { uploadUrl, fileUrl } = await presignRes.json();
      
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!uploadRes.ok) throw new Error("S3 Upload failed");
      
      updateStatus("checking", { s3Url: fileUrl });
      
      const selectedProduct = products.find(p => p.id === selectedProductId);
      const category = selectedProduct?.category || "general";
      
      const qcRes = await fetch("/api/quality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: fileUrl, productCategory: category })
      });
      
      const qcData = await qcRes.json();
      if (!qcRes.ok) throw new Error(qcData.error || "QC Check Failed");
      
      if (qcData.pass) {
        updateStatus("passed");
      } else {
        const failedLabels = qcData.failedChecks?.join(", ") || "";
        const detailedReason = `${qcData.reason} ${failedLabels ? `(${failedLabels})` : ""}`;
        updateStatus("failed", { qcReason: detailedReason });
      }
    } catch (err: any) {
      console.error(err);
      updateStatus("failed", { qcReason: err.message || "Network error. Please try again." });
    }
  };

  const removePhoto = (angleKey: AngleKeys) => {
    setPhotos(prev => ({
      ...prev,
      [angleKey]: { qcStatus: "empty" }
    }));
  };

  const handleFastTrackSubmit = async () => {
    if (!returnReason || !returnDescription.trim() || !selectedProductId) {
      setSubmitError("Please fill out all fields.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    
    try {
      const { data: insertData, error: insertError } = await supabase.from("returns").insert({
        buyer_id: "00000000-0000-0000-0000-000000000002",
        product_id: selectedProductId,
        status: "inspected",
        reason: returnReason,
        ai_grade: "A",
        ai_score: 98,
        ai_confidence: "High",
        ai_routing_decision: "standard_return",
        return_photo_urls: [],
        flaws_json: {
          flaws: [],
          buyer_description: returnDescription,
          is_fast_track: true
        }
      }).select("id").single();
      
      if (insertError) throw insertError;
      if (!insertData || !insertData.id) throw new Error("Failed to retrieve new return ID.");
      
      setGeneratedAwb(`AWB-${insertData.id.replace(/-/g, "").substring(0, 8).toUpperCase()}`);
      setStep(3);
      setSubmitting(false);
    } catch (err: any) {
      console.error("Submit Error:", err);
      setSubmitError(err.message || "Failed to submit return request.");
      setSubmitting(false);
    }
  };

  const handleSubmitPhotos = async () => {
    const allPassed = angleOrder.every(key => photos[key].qcStatus === "passed");
    if (!allPassed) {
      setSubmitError("You must successfully capture all 4 angles before submitting.");
      return;
    }
    
    setSubmitting(true);
    setSubmitError("");
    
    try {
      const { data: insertData, error: insertError } = await supabase.from("returns").insert({
        buyer_id: "00000000-0000-0000-0000-000000000002",
        product_id: selectedProductId,
        status: "processing",
        reason: returnReason,
        return_photo_urls: angleOrder.map(key => photos[key].s3Url),
        flaws_json: {
          buyer_description: returnDescription
        }
      }).select("id").single();
      
      if (insertError) throw insertError;
      if (!insertData || !insertData.id) throw new Error("Failed to retrieve new return ID.");
      
      const demoTrustScore = typeof window !== 'undefined' ? localStorage.getItem("DEMO_TRUST_OVERRIDE") : null;
      
      const processRes = await fetch("/api/process-return-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          returnId: insertData.id,
          demoTrustScore: demoTrustScore
        }),
      });

      if (!processRes.ok) {
        console.warn("AI processing failed, but return was submitted:", await processRes.text());
      }
      
      router.push("/returns/success");
      
    } catch (err: any) {
      console.error("Submit Error:", err);
      setSubmitError(err.message || "Failed to submit return request.");
      setSubmitting(false);
    }
  };

  const isUnlocked = (key: AngleKeys) => {
    const idx = angleOrder.indexOf(key);
    if (idx === 0) return true;
    const prevKey = angleOrder[idx - 1];
    return photos[prevKey].qcStatus === "passed";
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-900 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Start a Return</h1>
          <p className="text-slate-400 mt-2 text-sm">Follow the guided process to submit your return.</p>
        </div>
        
        <div className="p-6 sm:p-8">
          
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold border-b pb-2">Step 1: Item Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Product</label>
                {loadingProducts ? (
                  <div className="h-12 bg-slate-100 rounded animate-pulse"></div>
                ) : (
                  <select 
                    className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- Choose an item --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Why are you returning this item?</label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-800"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  <option value="">-- Choose return reason --</option>
                  {allReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 resize-y"
                  rows={3}
                  placeholder="Please provide details about the issue..."
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                />
              </div>
              
              <div className="pt-2">
                {selectedProductId && returnReason && returnDescription.trim() ? (
                  isFastTrack ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleFastTrackSubmit}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Return"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      Next: Capture Item Photos
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 bg-slate-200 text-slate-400 font-bold rounded-xl shadow-sm text-sm cursor-not-allowed"
                  >
                    Provide all details to continue
                  </button>
                )}
                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {submitError}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* STEP 2: Guided Photo Capture (for non fast-track) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-lg font-bold">Step 2: Item Photos</h2>
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline font-medium">Back</button>
              </div>
              
              <p className="text-sm text-slate-600">
                Please capture the 4 required angles. Our system checks each photo to ensure clarity.
              </p>
              
              <div className="space-y-4">
                {angleOrder.map((key) => {
                  const config = anglesConfig[key];
                  const state = photos[key];
                  const unlocked = isUnlocked(key);
                  
                  return (
                    <div 
                      key={key} 
                      className={`relative border rounded-xl p-4 transition-all duration-300 ${
                        !unlocked ? "opacity-50 bg-slate-50 grayscale" : 
                        state.qcStatus === 'passed' ? "border-green-200 bg-green-50/50" : 
                        state.qcStatus === 'failed' ? "border-red-300 bg-red-50" : "border-slate-300 bg-white shadow-sm"
                      }`}
                    >
                      {!unlocked && <div className="absolute inset-0 z-10"></div>}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className={`font-bold ${state.qcStatus === 'passed' ? 'text-green-800' : 'text-slate-800'}`}>
                            {config.label}
                          </h3>
                          <p className="text-xs text-slate-500">{config.desc}</p>
                        </div>
                        {state.qcStatus === "passed" && <CheckCircle className="w-6 h-6 text-green-500" />}
                        {state.qcStatus === "failed" && <AlertCircle className="w-6 h-6 text-red-500" />}
                      </div>

                      {state.qcStatus === "empty" || state.qcStatus === "failed" ? (
                        <div className="mt-2">
                          <input 
                            type="file" 
                            id={`capture-${key}`} 
                            accept="image/*" 
                            capture="environment"
                            className="hidden" 
                            onChange={(e) => handleCapture(e, key)} 
                          />
                          <label 
                            htmlFor={`capture-${key}`} 
                            className="cursor-pointer w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg flex justify-center items-center gap-2 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-400 transition"
                          >
                            <Camera className="w-5 h-5" />
                            {state.qcStatus === "failed" ? "Retake Photo" : "Open Camera"}
                          </label>
                          {state.qcStatus === "failed" && (
                            <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded flex items-start gap-1">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{state.qcReason}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-4 items-center mt-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <img src={state.preview} alt={key} className="w-16 h-16 object-cover rounded-md border" />
                          <div className="flex-1">
                            {state.qcStatus === "uploading" && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span>
                                Uploading...
                              </div>
                            )}
                            {state.qcStatus === "checking" && (
                              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                                <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></span>
                                Checking Clarity...
                              </div>
                            )}
                            {state.qcStatus === "passed" && (
                              <div className="text-sm font-semibold text-green-700">Perfect capture!</div>
                            )}
                          </div>
                          {state.qcStatus === "passed" && (
                            <button onClick={() => removePhoto(key)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {submitError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 flex items-center gap-2 mt-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {submitError}
                </div>
              )}
              
              <div className="pt-6 border-t mt-6">
                <button 
                  onClick={handleSubmitPhotos}
                  disabled={submitting || !angleOrder.every(key => photos[key].qcStatus === "passed")}
                  className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-50 disabled:bg-slate-400 flex justify-center items-center gap-2 hover:bg-slate-800 transition"
                >
                  {submitting ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      Submitting...
                    </>
                  ) : "Submit Return Request"}
                </button>
              </div>
              
            </div>
          )}
          
          {/* STEP 3: Fast-Track Confirmation & Barcode */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Return Request Initiated!</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Our delivery agent will inspect the item at pickup.
                </p>
              </div>

              {/* Air Waybill Barcode Box */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 space-y-3 max-w-sm mx-auto">
                <div className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
                  Air Waybill Barcode
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="h-14 flex items-center justify-center gap-1 overflow-hidden px-4">
                    {[4,2,6,1,3,2,5,1,2,4,3,1,5,2,4,1,3,2,4,2,5,1,3,4,2,1,3].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w * 2}px` }}
                      />
                    ))}
                  </div>
                  <div className="font-mono font-extrabold text-lg text-slate-900 tracking-widest">
                    {generatedAwb}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Show this barcode to the agent during doorstep pickup verification.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => router.push("/orders")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
                >
                  Track Return
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
                >
                  Back to Store
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
