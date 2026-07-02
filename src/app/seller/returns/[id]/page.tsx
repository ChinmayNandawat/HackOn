"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AnnotatedImage from "@/components/AnnotatedImage";
import { ReturnWithProduct } from "@/types/database";

const formatPrice = (price: number): string => {
  return `₹${Number(price).toLocaleString("en-IN")}`;
};
import {
  Sparkles,
  Check,
  Wrench,
  Heart,
  RefreshCw,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  X,
  Store,
  Tag,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Clock,
  Percent,
  CheckCircle2
} from "lucide-react";
import { SellerAutomationProvider, useSellerAutomation } from "@/context/SellerAutomationContext";
import { calculateBuyerTrustScore } from "@/lib/trustScore";

export default function AdminReturnDetailPage() {
  return (
    <SellerAutomationProvider>
      <AdminReturnDetailPageContent />
    </SellerAutomationProvider>
  );
}

function AdminReturnDetailPageContent() {
  const { isReturnAutoApproved } = useSellerAutomation();
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [record, setRecord] = useState<ReturnWithProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRelisting, setIsRelisting] = useState(false);
  const [relistSuccess, setRelistSuccess] = useState<{ newProductId: string, title: string } | null>(null);
  const [relistError, setRelistError] = useState<string | null>(null);

  // Dynamic overrides dropdown toggle
  const [overrideSelect, setOverrideSelect] = useState<string>("");

  // Refund offer state
  const [refundOfferAmount, setRefundOfferAmount] = useState<string>("");
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  // Lightbox state
  const [expandedImage, setExpandedImage] = useState<{ url: string, imageFlaws?: any[], originalIndex: number } | null>(null);

  // AI Inspection state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchReturnDetails();
  }, [id]);

  const fetchReturnDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("returns")
        .select(`
          id,
          product_id,
          status,
          return_reason:reason,
          image_urls:return_photo_urls,
          grade:ai_grade,
          score:ai_score,
          routing_decision:ai_routing_decision,
          confidence:ai_confidence,
          flaws_json,
          created_at,
          products (
            id,
            title,
            original_price,
            category,
            image_url,
            created_at
          )
        `)
        .eq("id", id)
        .single();

      if (fetchErr) throw fetchErr;
      if (!data) {
        throw new Error("Return record not found.");
      }

      const rawItem = data as any;
      const mappedRecord: ReturnWithProduct = {
        id: rawItem.id,
        product_id: rawItem.product_id,
        buyer_id: rawItem.buyer_id,
        status: rawItem.status,
        return_reason: rawItem.return_reason,
        image_urls: rawItem.image_urls || [],
        grade: rawItem.grade,
        score: rawItem.score,
        flaws: rawItem.flaws_json?.flaws || null,
        confidence: rawItem.confidence,
        routing_decision: rawItem.routing_decision,
        routing_reasoning: rawItem.flaws_json?.routing_reasoning || null,
        estimated_resale_price: rawItem.flaws_json?.estimated_resale_price || null,
        flaws_json: rawItem.flaws_json || null,
        created_at: rawItem.created_at,
        products: rawItem.products ? {
          id: rawItem.products.id,
          title: rawItem.products.title,
          original_price: Number(rawItem.products.original_price),
          category: rawItem.products.category,
          image_url: rawItem.products.image_url,
          created_at: rawItem.products.created_at,
        } : null
      };

      setRecord(mappedRecord);
      if (mappedRecord.routing_decision) {
        setOverrideSelect(mappedRecord.routing_decision);
      }
      if (mappedRecord.flaws_json?.suggested_refund_amount) {
        setRefundOfferAmount(String(mappedRecord.flaws_json?.refund_offer_amount || mappedRecord.flaws_json?.suggested_refund_amount || 0));
      }
    } catch (err: any) {
      console.error("[api/route-decision] Fetch return detail error:", err);
      setError(err?.message || "Failed to load return details.");
    } finally {
      setLoading(false);
    }
  };

  // Action Bar: Run AI Inspection (Fallback for stuck processing returns)
  const runFullAIInspection = async () => {
    setIsAnalyzing(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/process-return-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId: id }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }

      // Re-fetch to get updated grade, decision, and status
      await fetchReturnDetails();
      setSuccessMessage("AI Inspection completed successfully!");
    } catch (err: any) {
      console.error("AI Inspection error:", err);
      setError("AI Inspection failed: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };
  // Action Bar: Accept Decision
  const handleAcceptDecision = async () => {
    if (!record) return;
    setError(null);
    setSuccessMessage(null);

    try {
      // DB CHECK constraint restricts status to: processing, decision_ready, completed
      // Map 'relisted' and 'rejected' -> 'completed' (resolved status)
      const { error: updateError } = await supabase
        .from("returns")
        .update({
          status: "completed",
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setRecord((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: "completed",
        };
      });
      setSuccessMessage("Routing decision accepted and finalized in database!");
    } catch (err: any) {
      console.error("[api/route-decision] Accept Error:", err);
      setError("Failed to finalize return status: " + err.message);
    }
  };

  // Action Bar: Send Refund Offer
  const handleSendOffer = async () => {
    if (!record || !refundOfferAmount) return;
    setIsSendingOffer(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const currentFlawsJson = record.flaws_json || {};
      const updatedFlawsJson = {
        ...currentFlawsJson,
        refund_offer_amount: Number(refundOfferAmount),
        offer_sent_to_buyer: true
      };

      const { error: updateError } = await supabase
        .from("returns")
        .update({
          flaws_json: updatedFlawsJson,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setRecord((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          flaws_json: updatedFlawsJson,
        };
      });
      setSuccessMessage(`Partial refund offer of ₹${refundOfferAmount} sent to buyer!`);
    } catch (err: any) {
      console.error("Send Offer Error:", err);
      setError("Failed to send offer: " + err.message);
    } finally {
      setIsSendingOffer(false);
    }
  };

  // Action Bar: Relist Decision
  const handleRelist = async () => {
    if (!record) return;

    // Guard
    if (record.grade === null) {
      setError("Run AI Inspection first before relisting");
      return;
    }

    setIsRelisting(true);
    setRelistError(null);
    setRelistSuccess(null);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/relist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnId: id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to relist product");
      }

      setRelistSuccess({ newProductId: data.newProductId, title: data.generatedTitle });

      setRecord((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: "relisted",
        };
      });
    } catch (err: any) {
      console.error("Relist error:", err);
      setRelistError(err.message || "An unexpected error occurred during relisting");
      // Intentionally not setting isRelisting to false here so the 'Try Again' button handles it
    }
  };

  // Action Bar: Reject Decision
  const handleRejectDecision = async () => {
    if (!record) return;
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase
        .from("returns")
        .update({ status: "rejected" })
        .eq("id", id);

      if (updateError) throw updateError;

      setRecord((prev) => {
        if (!prev) return null;
        return { ...prev, status: "rejected" };
      });
      setSuccessMessage("Return request has been declined.");
    } catch (err: any) {
      console.error("[api/route-decision] Reject Error:", err);
      setError("Failed to reject return: " + err.message);
    }
  };

  // Action Bar: Override Decision
  const handleOverrideDecision = async (newDecision: string) => {
    if (!record || !newDecision) return;
    setError(null);
    setSuccessMessage(null);

    try {
      // Update reasoning inside flaws_json for the override
      const currentFlaws = record.flaws || [];
      const updatedFlawsJson = {
        flaws: currentFlaws,
        routing_reasoning: `Overridden manually by Administrator to: ${newDecision.replace(/_/g, " ")}.`,
        estimated_resale_price: record.estimated_resale_price || 0,
      };

      const { error: updateError } = await supabase
        .from("returns")
        .update({
          ai_routing_decision: newDecision,
          flaws_json: updatedFlawsJson,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setRecord((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routing_decision: newDecision,
          routing_reasoning: updatedFlawsJson.routing_reasoning,
          flaws_json: updatedFlawsJson,
        };
      });
      setOverrideSelect(newDecision);
      setSuccessMessage("Routing decision successfully overridden by administrator!");
    } catch (err: any) {
      console.error("[api/route-decision] Override Error:", err);
      setError("Failed to save override decision: " + err.message);
    }
  };

  // Helper: classify flaw bounding box to grid quadrants
  const getFlawLocationText = (x: number, y: number): string => {
    let horizontal = "center";
    let vertical = "middle";

    if (x < 33) horizontal = "left";
    else if (x > 66) horizontal = "right";

    if (y < 33) vertical = "top";
    else if (y > 66) vertical = "bottom";

    if (horizontal === "center" && vertical === "middle") {
      return "center area";
    }
    return `${vertical}-${horizontal} area`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <span className="text-sm text-gray-500 font-semibold">Loading return details...</span>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white p-6 max-w-md w-full border border-red-200 shadow rounded-xl text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-gray-800">Return Detail Failed</h1>
          <button
            onClick={() => router.push("/seller/returns")}
            className="mt-6 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!record) return null;

  const product = record.products;
  const title = product?.title || "Unknown Product";
  const category = product?.category || "N/A";
  const originalPrice = product?.original_price || 0;
  const photos = record.image_urls || [];

  // Stored state parsing
  const hasInspectionResults = record.grade !== null;
  const flaws = record.flaws || [];
  const reasoning = record.routing_reasoning || "";
  const resalePrice = record.estimated_resale_price || 0;

  let currentStatusLabel: string = record.status;
  if (record.status === "processing") currentStatusLabel = "Awaiting AI";
  else if (record.status === "inspected") {
    if (record.routing_decision === "keep_and_refund" && (record as any).flaws_json?.offer_sent_to_buyer) {
      currentStatusLabel = "Pending Buyer Response";
    } else {
      currentStatusLabel = "Needs Seller Review";
    }
  } else if (record.status === "relisted") currentStatusLabel = "Relisted";
  else if (record.status === "rejected") currentStatusLabel = "Declined";
  else if (record.status === "accepted") currentStatusLabel = "Approved";
  else if (record.status === "standard_refund") currentStatusLabel = "Standard Refund";
  else if (record.status === "completed") {
    if (record.routing_decision === "donate") currentStatusLabel = "Donated";
    else if (record.routing_decision === "recycle") currentStatusLabel = "Recycled";
    else if (record.routing_decision === "keep_and_refund") currentStatusLabel = "Partial Refund Accepted";
    else currentStatusLabel = "Resolved";
  }

  const statusClasses: Record<string, string> = {
    processing: "bg-amber-50 text-amber-700 border-amber-200",
    inspected: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    relisted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  // Grade color matching
  const gradeColors = {
    A: "text-emerald-600",
    B: "text-teal-600",
    C: "text-amber-500",
    D: "text-red-600",
  };

  const gradeClasses = record.grade ? gradeColors[record.grade as keyof typeof gradeColors] : "";
  const trustProfile = record ? calculateBuyerTrustScore(record) : null;
  const autoApproved = record?.flaws_json?.auto_approved === true;
  const willAutoApprove = record?.status === "processing" && record ? isReturnAutoApproved(record) : false;

  // SORTING & CONTEXT-AWARE FLAW FILTERING
  // Map images to their specific flaws, calculate a damage score, and sort (most damaged first).
  const processedPhotos = photos.map((url, originalIndex) => {
    // Find flaws that were specifically tagged for this image index by the AI
    const imageFlaws = flaws.filter((f: any) => f.image_index === originalIndex);

    // Calculate damage severity score for sorting
    let damageScore = 0;
    imageFlaws.forEach((f: any) => {
      if (f.severity === "major") damageScore += 100;
      else if (f.severity === "moderate") damageScore += 10;
      else if (f.severity === "minor") damageScore += 1;
    });

    return { url, originalIndex, imageFlaws, damageScore };
  }).sort((a, b) => b.damageScore - a.damageScore); // Highest damage first

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/seller/returns"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to returns list
        </Link>

        {/* Success toast message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Error toast message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Product Meta Header */}
        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold mt-2">
            <span>{category}</span>
            <span>•</span>
            <span className="text-gray-700">Original Price: ₹{Number(originalPrice).toLocaleString("en-IN")}</span>
          </div>
        </header>

        {/* AI Automated Override Alert Banner */}
        {autoApproved && trustProfile && (
          <div className="mb-8 p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-white rounded-xl border border-emerald-100 text-emerald-600 shadow-sm flex-shrink-0">
                <Zap className="w-7 h-7 fill-current animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-extrabold text-emerald-900 tracking-tight">Auto-Processed by System</h3>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200">
                    AI Automated Override
                  </span>
                </div>
                <p className="text-sm text-emerald-800/80 font-medium max-w-xl">
                  This return bypassed manual review. The item value (₹{Number(originalPrice).toLocaleString("en-IN")}) is under your auto-refund threshold and the buyer has an excellent Trust Score ({trustProfile.score}%).
                </p>
              </div>
            </div>
            <div className="bg-white border border-emerald-100 px-5 py-3 rounded-xl text-emerald-700 text-sm font-bold flex items-center gap-2 shadow-sm relative z-10 self-start md:self-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Resolved Automatically
            </div>
          </div>
        )}

        {willAutoApprove && trustProfile && (
          <div className="mb-8 p-5 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-white rounded-xl border border-amber-100 text-amber-500 shadow-sm flex-shrink-0">
                <Zap className="w-7 h-7 fill-current animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-extrabold text-amber-900 tracking-tight">Predicted to be Auto-Approved</h3>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200">
                    Awaiting AI Inspection
                  </span>
                </div>
                <p className="text-sm text-amber-800/80 font-medium max-w-xl">
                  This item appears to qualify under your automated return threshold (Value under limit & Buyer Trust Score is {trustProfile.score}%).
                </p>
              </div>
            </div>
            <div className="bg-white border border-amber-100 px-5 py-3 rounded-xl text-amber-700 text-sm font-bold flex items-center gap-2 shadow-sm relative z-10 self-start md:self-center whitespace-nowrap">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Auto-Approval
            </div>
          </div>
        )}

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* LEFT COLUMN: Return Context */}
          <div className="space-y-6">
            {/* Buyer Trust Profile Breakdown Card */}
            {trustProfile && (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${trustProfile.badgeBg} ${trustProfile.iconColor}`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Buyer Trust Profile</h2>
                      <span className="text-[10px] text-gray-400 font-semibold block">ID: {trustProfile.buyerId.substring(0, 13)}...</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-extrabold flex items-center gap-1 ${trustProfile.badgeColor}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {trustProfile.score}% ({trustProfile.tier})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-150/60 flex flex-col items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="text-sm font-black text-gray-800">{trustProfile.orderVolume}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">Orders</span>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-150/60 flex flex-col items-center justify-center">
                    <Percent className="w-4 h-4 text-amber-500 mb-1" />
                    <span className="text-sm font-black text-gray-800">{trustProfile.pastReturnRate}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">Return Rate</span>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-150/60 flex flex-col items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="text-sm font-black text-gray-800">{trustProfile.timingHours}h</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">Post-Delivery</span>
                  </div>
                </div>
              </div>
            )}

            {/* Return Details Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Return Details</h2>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Return Reason</span>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">&quot;{record.return_reason}&quot;</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Submission Date</span>
                    <p className="text-gray-700 font-semibold">{new Date(record.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">Current Status</span>
                    <span className={`px-2 py-0.5 rounded border font-bold inline-block mt-1 ${statusClasses[record.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                      {currentStatusLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Return Images */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Uploaded Return Photos</h2>
              {processedPhotos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No photos submitted by buyer.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {processedPhotos.map((photoItem, displayIndex) => (
                    <div
                      key={photoItem.originalIndex}
                      className="aspect-square relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center cursor-pointer group hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={() => setExpandedImage(photoItem)}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-20" />
                      {hasInspectionResults ? (
                        <AnnotatedImage
                          imageUrl={photoItem.url}
                          flaws={photoItem.imageFlaws} // Only pass flaws for this exact image
                          width={400}
                          height={400}
                        />
                      ) : (
                        <img
                          src={photoItem.url}
                          alt={`Return Capture ${photoItem.originalIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Image Labels */}
                      <div className="absolute bottom-2 left-2 flex gap-1 z-10">
                        <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                          Angle {photoItem.originalIndex + 1}
                        </span>
                        {photoItem.damageScore > 0 && (
                          <span className="bg-red-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            {photoItem.imageFlaws.length} Defect{photoItem.imageFlaws.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AI Command Center */}
          <div className="space-y-6">
            {/* The AI Call Trigger Button was removed since it is now fully automated. */}

            {/* AI Results Display */}
            {hasInspectionResults && (
              <div className="space-y-6">

                {/* Section 1: Grade Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    AI Quality Grade
                  </span>

                  <span className={`text-8xl font-black ${gradeClasses} mb-1`}>
                    {record.grade}
                  </span>

                  <span className="text-base font-bold text-gray-700 mb-3">
                    Score: {record.score}/100
                  </span>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-400 font-semibold">Confidence:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${record.confidence === "High" ? "bg-green-50 text-green-700 border-green-200" :
                        record.confidence === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                      }`}>
                      {record.confidence}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 max-w-sm italic border-t border-gray-100 pt-3 w-full">
                    &quot;{record.routing_reasoning ? "Persisted details" : record.return_reason}&quot;
                  </p>
                </div>

                {/* Section 2: Flaw Map */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">AI Flaw Map</h3>
                  {flaws.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No defects identified by the AI vision grader.</p>
                  ) : (
                    <div className="space-y-3">
                      {flaws.map((flaw: any, index: number) => {
                        const locationLabel = getFlawLocationText(flaw.x_percent, flaw.y_percent);
                        const severityColors = {
                          minor: "bg-gray-100 text-gray-700 border-gray-200",
                          moderate: "bg-amber-50 text-amber-700 border-amber-200",
                          major: "bg-red-50 text-red-700 border-red-200",
                        }[flaw.severity as "minor" | "moderate" | "major"] || "bg-gray-50 text-gray-500 border-gray-100";

                        return (
                          <div key={index} className="p-3 border border-gray-100 rounded-lg flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-gray-700 block truncate">{flaw.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5 block">
                                Location: {locationLabel}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${severityColors}`}>
                              {flaw.severity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 3: Routing Decision */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Optimal Pathway Routing</h3>

                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className={`p-2.5 rounded-lg text-white ${record.routing_decision === "relist_as_refurbished" ? "bg-green-500" :
                        record.routing_decision === "standard_return" ? "bg-blue-500" :
                          record.routing_decision === "donate" ? "bg-blue-500" :
                            "bg-gray-500"
                      }`}>
                      {record.routing_decision === "relist_as_refurbished" && <Check className="w-5 h-5" />}
                      {record.routing_decision === "standard_return" && <ArrowLeft className="w-5 h-5" />}
                      {record.routing_decision === "donate" && <Heart className="w-5 h-5" />}
                      {record.routing_decision === "recycle" && <RefreshCw className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wide block">Recommended Action</span>
                      <span className="text-sm font-extrabold text-gray-800">
                        {record.routing_decision === "relist_as_refurbished" && "Relist as Refurbished"}
                        {record.routing_decision === "standard_return" && "Standard Return"}
                        {record.routing_decision === "donate" && "Donate"}
                        {record.routing_decision === "recycle" && "Recycle"}
                        {record.routing_decision === "keep_and_refund" && "Keep & Partial Refund"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-4 leading-relaxed bg-blue-50/20 border border-blue-50 p-3 rounded-lg">
                    {reasoning}
                  </p>

                  {resalePrice > 0 && (
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                      <span className="text-xs font-semibold text-gray-400">Suggested Refurbished Price</span>
                      <span className="text-base font-extrabold text-gray-800">
                        {formatPrice(resalePrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Section 4: Action Bar */}
                {record.status !== "completed" && record.status !== "relisted" && record.status !== "rejected" ? (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Dashboard Actions</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Action Button Logic */}
                      {record.status === "processing" ? (
                        <button
                          onClick={runFullAIInspection}
                          disabled={isAnalyzing}
                          className="col-span-1 sm:col-span-2 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:bg-amber-400"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Running AI Inspection...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Retry AI Inspection
                            </>
                          )}
                        </button>
                      ) : relistSuccess ? (
                        <div className="col-span-1 sm:col-span-2 bg-green-50 p-4 border border-green-200 rounded-xl text-center">
                          <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <h3 className="font-bold text-green-700 text-sm">Successfully Listed!</h3>
                          <p className="text-xs text-green-600 mt-1 mb-3 font-semibold">{relistSuccess.title}</p>
                          <Link
                            href={`/product/${relistSuccess.newProductId}`}
                            className="inline-block py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-xs"
                          >
                            View Listing
                          </Link>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {record.routing_decision === "relist_as_refurbished" ? (
                            <button
                              onClick={handleRelist}
                              disabled={isRelisting}
                              className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:scale-100"
                            >
                              {isRelisting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Creating listing...
                                </>
                              ) : (
                                <>
                                  <Store className="w-4 h-4" />
                                  Relist as Refurbished
                                </>
                              )}
                            </button>
                          ) : record.routing_decision === "keep_and_refund" ? (
                            <div className="w-full">
                              {record.status === "standard_refund" ? (
                                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center flex flex-col gap-2">
                                  <p className="text-slate-700 font-bold text-xs">Buyer Rejected Offer & Requested Standard Refund</p>
                                  <button onClick={handleAcceptDecision} className="w-full py-2 bg-slate-800 text-white rounded hover:bg-slate-900 font-bold text-xs">
                                    Approve & Complete
                                  </button>
                                </div>
                              ) : record.status === "accepted" ? (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center flex flex-col gap-2">
                                  <p className="text-green-700 font-bold text-xs">Buyer Accepted Offer of ₹{record.flaws_json?.refund_offer_amount}</p>
                                  <button onClick={handleAcceptDecision} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold text-xs">
                                    Approve & Complete
                                  </button>
                                </div>
                              ) : record.flaws_json?.offer_sent_to_buyer ? (
                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
                                  <p className="text-emerald-700 font-bold text-xs">Offer Sent to Buyer: ₹{record.flaws_json.refund_offer_amount}</p>
                                  <p className="text-[10px] text-emerald-600 mt-1">Awaiting buyer response.</p>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <label className="text-xs font-bold text-gray-700">Refund Offer Amount (₹)</label>
                                  <input
                                    type="number"
                                    value={refundOfferAmount}
                                    onChange={(e) => setRefundOfferAmount(e.target.value)}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 500"
                                  />
                                  <p className="text-[10px] text-gray-500 italic">AI Suggested: ₹{record.flaws_json?.suggested_refund_amount || 0}</p>
                                  <button
                                    onClick={handleSendOffer}
                                    disabled={isSendingOffer || !refundOfferAmount}
                                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition disabled:bg-gray-300"
                                  >
                                    {isSendingOffer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Send Offer to Buyer
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : record.routing_decision === "reject" ? (
                            <button
                              onClick={handleRejectDecision}
                              className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Decline Return
                            </button>
                          ) : (
                            <button
                              onClick={handleAcceptDecision}
                              className="w-full py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Approve & Finalize
                            </button>
                          )}

                          {relistError && (
                            <div className="bg-red-50 p-3 border border-red-200 rounded-lg text-center mt-2">
                              <p className="text-red-700 text-xs font-bold mb-2">{relistError}</p>
                              <button
                                onClick={() => { setRelistError(null); setIsRelisting(false); }}
                                className="text-[10px] uppercase font-bold px-3 py-1 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                              >
                                Try Again
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Override Select Dropdown */}
                      {!relistSuccess && !record.flaws_json?.offer_sent_to_buyer && record.status !== "accepted" && record.status !== "standard_refund" && (
                        <div className="relative">
                          <select
                            value={overrideSelect}
                            onChange={(e) => handleOverrideDecision(e.target.value)}
                            className="w-full py-2.5 px-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg font-bold text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer h-[40px]"
                          >
                            <option value="" disabled>Override Decision...</option>
                            <option value="relist_as_refurbished">Relist as Refurbished</option>
                            <option value="standard_return">Standard Return</option>
                            <option value="keep_and_refund">Keep & Partial Refund</option>
                            <option value="donate">Donate</option>
                            <option value="recycle">Recycle</option>
                            <option value="reject">Reject Return</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <HelpCircle className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 border border-green-200 text-green-700 font-bold rounded-xl text-center text-xs flex flex-col items-center justify-center gap-2">
                    <Check className="w-6 h-6 text-green-500" />
                    Return Finalized & Resolved
                    {relistSuccess && (
                      <Link
                        href={`/product/${relistSuccess.newProductId}`}
                        className="mt-2 inline-block py-1.5 px-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold text-xs"
                      >
                        View Listing
                      </Link>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-12 animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-square bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white rounded-full p-2 z-50 transition-colors"
              onClick={() => setExpandedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            {hasInspectionResults ? (
              <AnnotatedImage
                imageUrl={expandedImage.url}
                flaws={expandedImage.imageFlaws || []}
                width={1000}
                height={1000}
              />
            ) : (
              <img
                src={expandedImage.url}
                alt="Enlarged Return Capture"
                className="w-full h-full object-contain"
              />
            )}
            <div className="absolute bottom-6 left-6 flex gap-3 z-50">
              <span className="bg-black/80 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg backdrop-blur-md">
                Angle {expandedImage.originalIndex + 1}
              </span>
              {expandedImage.imageFlaws && expandedImage.imageFlaws.length > 0 && (
                <span className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg shadow-red-900/50">
                  {expandedImage.imageFlaws.length} Defect{expandedImage.imageFlaws.length > 1 ? 's' : ''} Highlighted
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
