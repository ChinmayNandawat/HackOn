"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react";

export default function NewReturnPage() {
  const router = useRouter();
  
  // Step State
  const [step, setStep] = useState<1 | 2>(1);
  
  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  
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

  // Load products to select
  useEffect(() => {
    async function loadProducts() {
      // Fetch only the 3 products that act as our mock "orders"
      const { data } = await supabase.from("products").select("*").limit(3);
      if (data) setProducts(data);
      setLoadingProducts(false);
      
      // Auto-select product if coming from orders page
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
    
    // Update local state immediately
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
      // 1. Upload to S3 via Presigned URL
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
      
      // 2. Run AI Quality Check
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

  const handleSubmit = async () => {
    // Validate all 4 are passed
    const allPassed = angleOrder.every(key => photos[key].qcStatus === "passed");
    if (!allPassed) {
      setSubmitError("You must successfully capture all 4 angles before submitting.");
      return;
    }
    
    setSubmitting(true);
    setSubmitError("");
    
    try {
      const { error } = await supabase.from("returns").insert({
        buyer_id: "00000000-0000-0000-0000-000000000002",
        product_id: selectedProductId,
        status: "processing",
        reason: returnReason,
        return_photo_urls: angleOrder.map(key => photos[key].s3Url),
      });
      
      if (error) throw error;
      
      router.push("/returns/success");
      
    } catch (err: any) {
      console.error("Submit Error:", err);
      setSubmitError(err.message || "Failed to submit return request.");
      setSubmitting(false);
    }
  };

  // Logic to determine if a block should be unlocked
  const isUnlocked = (key: AngleKeys) => {
    const idx = angleOrder.indexOf(key);
    if (idx === 0) return true; // first is always unlocked
    // Unlocked if the previous one is 'passed'
    const prevKey = angleOrder[idx - 1];
    return photos[prevKey].qcStatus === "passed";
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Start a Return</h1>
          <p className="text-slate-400 mt-2 text-sm">Follow the guided capture to submit your return.</p>
        </div>
        
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: Product Selection */}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Why are you returning it?</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Too small, defective, didn't match description..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!selectedProductId || !returnReason}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  Next: Capture Photos
                </button>
              </div>
            </div>
          )}
          
          {/* STEP 2: Guided Photo Capture */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-lg font-bold">Step 2: Guided Capture</h2>
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline font-medium">Back</button>
              </div>
              
              <p className="text-sm text-slate-600">
                Please capture the 4 required angles. Our AI instantly checks each photo to ensure clarity.
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
                      {!unlocked && <div className="absolute inset-0 z-10"></div>} {/* Invisible blocker */}
                      
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

                      {/* Display State */}
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
                                AI Checking Clarity...
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
                  onClick={handleSubmit}
                  disabled={submitting || !angleOrder.every(key => photos[key].qcStatus === "passed")}
                  className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-50 disabled:bg-slate-400 flex justify-center items-center gap-2 hover:bg-slate-800 transition"
                >
                  {submitting ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      Submitting Return...
                    </>
                  ) : "Submit Return Request"}
                </button>
              </div>
              
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}
