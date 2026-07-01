"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ReturnWithProduct } from "@/types/database";
import { 
  ArrowRight, 
  BarChart3, 
  Clock, 
  FileText, 
  Layers, 
  AlertCircle,
  ShieldCheck,
  Zap
} from "lucide-react";
import SellerNav from "@/components/SellerNav";
import { SellerAutomationProvider, useSellerAutomation } from "@/context/SellerAutomationContext";
import AutomatedOverrideCard from "@/components/seller/AutomatedOverrideCard";
import { calculateBuyerTrustScore } from "@/lib/trustScore";

export default function AdminReturnsListPage() {
  return (
    <SellerAutomationProvider>
      <AdminReturnsListPageContent />
    </SellerAutomationProvider>
  );
}

function AdminReturnsListPageContent() {
  const { isReturnAutoApproved } = useSellerAutomation();
  const [returns, setReturns] = useState<ReturnWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Client-side Filter state: 'all' | 'processing' | 'inspected' | 'relisted' | 'donated'
  const [filter, setFilter] = useState<"all" | "processing" | "inspected" | "relisted" | "donated">("all");

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalThisMonth: 0,
    pendingInspection: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchReturnsAndMetrics();
  }, []);

  const fetchReturnsAndMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch returns joined with products
      const { data, error: fetchError } = await supabase
        .from("returns")
        .select(`
          id,
          product_id,
          buyer_id,
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
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Map raw data from PostgREST query to typed ReturnWithProduct interface
      const mappedData: ReturnWithProduct[] = (data || []).map((rawItem: any) => ({
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
        offer_sent_to_buyer: rawItem.flaws_json?.offer_sent_to_buyer || false,
        created_at: rawItem.created_at,
        products: rawItem.products ? {
          id: rawItem.products.id,
          title: rawItem.products.title,
          original_price: Number(rawItem.products.original_price),
          category: rawItem.products.category,
          image_url: rawItem.products.image_url,
          created_at: rawItem.products.created_at,
        } : null
      }));

      setReturns(mappedData);

      // 2. Compute summary metrics from the fetched dataset
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let monthlyCount = 0;
      let pendingCount = 0;
      let totalScore = 0;
      let scoredCount = 0;

      mappedData.forEach((item) => {
        const date = new Date(item.created_at);
        
        // Month match check
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          monthlyCount++;
        }
        
        // Pending check
        if (item.status === "processing") {
          pendingCount++;
        }

        // Avg Score check (inspected items with scores)
        if (item.status !== "processing" && item.score !== null && item.score !== undefined) {
          totalScore += item.score;
          scoredCount++;
        }
      });

      setMetrics({
        totalThisMonth: monthlyCount,
        pendingInspection: pendingCount,
        avgScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0,
      });

    } catch (err: any) {
      console.error("Error fetching returns dashboard data:", err);
      setError(err?.message || "Failed to load dashboard metrics and returns.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: format relative timestamp
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
  };

  // Helper: format price to INR
  const formatPrice = (price: number): string => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  // Filter returns based on state
  const filteredReturns = returns.filter((item) => {
    if (filter === "all") return true;
    if (filter === "donated") return item.status === "completed" && item.routing_decision === "donate";
    return item.status === filter;
  });

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Returns Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyze, grade, and route returned inventory.
          </p>
        </header>

        <SellerNav />

        <AutomatedOverrideCard returns={returns} />

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Error: {error}</p>
          </div>
        )}

        {/* Section 1: Summary Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Returns This Month */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Returns This Month
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <span className="text-3xl font-black text-gray-800">{metrics.totalThisMonth}</span>
              )}
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Pending Inspection */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Pending Inspection
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <span className="text-3xl font-black text-amber-600">{metrics.pendingInspection}</span>
              )}
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Avg Grade Score */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Avg Quality Score
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <span className="text-3xl font-black text-green-600">
                  {metrics.avgScore > 0 ? `${metrics.avgScore}/100` : "N/A"}
                </span>
              )}
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Section 2: Filter Bar */}
        <section className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                filter === "all" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("processing")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                filter === "processing" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("inspected")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                filter === "inspected" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Inspected
            </button>
            <button
              onClick={() => setFilter("relisted")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                filter === "relisted" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Relisted
            </button>
            <button
              onClick={() => setFilter("donated")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                filter === "donated" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Donated
            </button>
          </div>

          <span className="text-xs text-gray-400 font-medium">
            Showing {filteredReturns.length} return{filteredReturns.length !== 1 ? "s" : ""}
          </span>
        </section>

        {/* Section 3: Returns List */}
        <section className="space-y-4">
          {loading ? (
            // Skeleton Loader States
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : filteredReturns.length === 0 ? (
            // Empty State
            <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700">No returns yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                They will appear here when buyers submit them.
              </p>
            </div>
          ) : (
            // Returns Cards List
            filteredReturns.map((item) => {
              const product = item.products;
              const title = product?.title || "Unknown Product";
              const category = product?.category || "N/A";
              const originalPrice = product?.original_price || 0;
              const hasThumbnail = item.image_urls && item.image_urls.length > 0;
              const firstImage = hasThumbnail ? item.image_urls[0] : null;

              // Color codes for status
              const statusClasses: Record<string, string> = {
                processing: "bg-amber-50 text-amber-700 border-amber-200",
                inspected: "bg-blue-50 text-blue-700 border-blue-200",
                relisted: "bg-emerald-50 text-emerald-700 border-emerald-200",
                completed: "bg-green-50 text-green-700 border-green-200",
                accepted: "bg-teal-50 text-teal-700 border-teal-200",
                standard_refund: "bg-purple-50 text-purple-700 border-purple-200",
                rejected: "bg-red-50 text-red-700 border-red-200",
              };

              const statusLabels: Record<string, string> = {
                processing: "Pending",
                inspected: "Inspected",
                relisted: "Relisted",
                completed: "Completed",
                accepted: "Accepted",
                standard_refund: "Refunded",
                rejected: "Rejected",
              };
              
              const currentStatusClass = statusClasses[item.status] || "bg-gray-50 text-gray-700 border-gray-200";
              const currentStatusLabel = (item.status === "inspected" && item.routing_decision === "keep_and_refund" && (item as any).offer_sent_to_buyer)
                ? "Offer Sent"
                : statusLabels[item.status] || item.status;

              // Color codes for Grade (A green, B teal, C amber, D red)
              const gradeClasses = item.grade ? {
                A: "bg-emerald-50 text-emerald-700 border-emerald-200",
                B: "bg-teal-50 text-teal-700 border-teal-200",
                C: "bg-amber-50 text-amber-700 border-amber-200",
                D: "bg-red-50 text-red-700 border-red-200",
              }[item.grade] : "";

              const trustProfile = calculateBuyerTrustScore(item);
              const autoApproved = isReturnAutoApproved(item);

              return (
                <Link
                  key={item.id}
                  href={`/seller/returns/${item.id}`}
                  className={`p-5 rounded-xl border shadow-sm flex items-start gap-4 hover:border-blue-300 hover:shadow-md transition group block ${
                    autoApproved
                      ? "border-emerald-400/80 ring-2 ring-emerald-500/20 bg-emerald-50/10"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Thumbnail */}
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={title}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs font-semibold uppercase">
                      {title.substring(0, 2)}
                    </div>
                  )}

                  {/* Card Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <h3 className="text-sm font-extrabold text-gray-800 truncate group-hover:text-blue-600 transition">
                        {title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${currentStatusClass}`}>
                          {currentStatusLabel}
                        </span>

                        {/* Grade Badge */}
                        {item.grade && (
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${gradeClasses}`}>
                            Grade {item.grade}
                          </span>
                        )}

                        {/* Buyer Trust Score Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${trustProfile.badgeColor}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Trust Score: {trustProfile.score}% ({trustProfile.tier.replace(" Trust", "")})
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 font-semibold space-x-2 flex items-center flex-wrap gap-y-1">
                      <span>{category}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600 font-bold">{formatPrice(originalPrice)}</span>
                      <span className="text-gray-300">•</span>
                      <span>Reason: <span className="text-gray-500 font-normal italic">"{item.return_reason}"</span></span>
                    </div>

                    {/* Auto-Approval Banner */}
                    {autoApproved && (
                      <div className="mt-2.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm animate-pulse w-fit">
                        <Zap className="w-3.5 h-3.5 fill-current flex-shrink-0" />
                        <span>⚡ AUTO-APPROVED BY SYSTEM — Instant Refund Issued</span>
                      </div>
                    )}
                  </div>

                  {/* Right Arrow/Time indicator */}
                  <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0 pl-2">
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {getRelativeTime(item.created_at)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
