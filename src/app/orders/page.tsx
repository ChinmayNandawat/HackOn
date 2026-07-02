"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Cloud, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  Package, 
  Truck, 
  Star, 
  RotateCcw, 
  Search, 
  ShieldCheck, 
  Zap,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [returnsMap, setReturnsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionErrorId, setActionErrorId] = useState<{ id: string; msg: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "returns" | "cancelled">("orders");
  const [searchQuery, setSearchQuery] = useState("");

  const BUYER_ID = "00000000-0000-0000-0000-000000000002";

  useEffect(() => {
    async function loadData() {
      try {
        const impactRes = await fetch(`/api/impact?sessionId=${BUYER_ID}`);
        if (impactRes.ok) {
          const impactData = await impactRes.json();
          setCredits(impactData.personal?.total_credits || 0);
        }
      } catch (err) {
        console.error("Failed to fetch impact", err);
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, products(id, title, image_url, category, original_price)")
        .eq("buyer_id", BUYER_ID)
        .order("created_at", { ascending: false });

      // Fetch returns
      const { data: returnsData } = await supabase
        .from("returns")
        .select("*")
        .eq("buyer_id", BUYER_ID);

      if (ordersData) setOrders(ordersData);
      
      if (returnsData) {
        const rMap: Record<string, any> = {};
        for (const ret of returnsData) {
          rMap[ret.product_id] = ret;
        }
        setReturnsMap(rMap);
      }
      
      setLoading(false);
    }
    
    loadData();
  }, []);

  const handleAcceptDecision = async (ret: any) => {
    setActionLoadingId(ret.id);
    setActionErrorId(null);
    
    try {
      const { error } = await supabase
        .from("returns")
        .update({ status: "accepted" })
        .eq("id", ret.id);

      if (error) throw error;

      setReturnsMap(prev => ({
        ...prev,
        [ret.product_id]: { ...prev[ret.product_id], status: "accepted" }
      }));
      
      setToastMsg("Offer accepted! Waiting for seller to finalize.");
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setActionErrorId({ id: ret.id, msg: err.message || "Failed to accept decision. Please try again." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStandardRefund = async (ret: any) => {
    setActionLoadingId(ret.id);
    setActionErrorId(null);
    
    try {
      const { error } = await supabase
        .from("returns")
        .update({ status: "standard_refund" })
        .eq("id", ret.id);

      if (error) throw error;

      setReturnsMap(prev => ({
        ...prev,
        [ret.product_id]: { ...prev[ret.product_id], status: "standard_refund" }
      }));
    } catch (err: any) {
      console.error(err);
      setActionErrorId({ id: ret.id, msg: err.message || "Failed to request refund." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDecisionText = (decision: string, amount?: number) => {
    if (decision === "relist_as_refurbished") return "Return approved — pending seller confirmation.";
    if (decision === "needs_repair_then_relist") return "Return approved — pending seller confirmation.";
    if (decision === "keep_and_refund" || decision === "keep_refund") {
      return amount ? `Keep your item — the seller has offered a partial refund of ₹${amount}.` : "The seller is reviewing your return to offer a partial refund.";
    }
    if (decision === "donate") return "Item marked for donation — pending seller confirmation.";
    if (decision === "reject") return "Inspection found no valid defects. Pending final seller confirmation.";
    return "Return processed — pending seller confirmation.";
  };

  const getCreditsForDecision = (decision: string) => {
    if (decision === "keep_and_refund" || decision === "keep_refund") return 50;
    if (decision === "buy_refurbished") return 30;
    return 15;
  };

  const getCompletedOutcomeText = (ret: any) => {
    if (ret.status === "relisted") return "Your return was accepted, and the item has been listed as refurbished to find a new home.";
    if (ret.ai_routing_decision === "donate") return "Your return was processed, and your item was successfully donated to a local charity.";
    if (ret.ai_routing_decision === "recycle") return "Your return was processed, and the item was responsibly recycled.";
    if (ret.ai_routing_decision?.includes("keep")) return "You kept the item and received a partial refund. Thank you for reducing carbon emissions!";
    if (ret.status === "rejected") return "Your return request was declined after inspection.";
    return "Your return has been fully processed and a refund has been issued.";
  };

  const filteredOrders = orders.filter((order) => {
    const p = Array.isArray(order.products) ? order.products[0] : order.products;
    if (!p) return false;
    const ret = returnsMap[p.id];
    if (activeTab === "returns") return !!ret;
    if (activeTab === "cancelled") return order.status === "cancelled";
    if (searchQuery) {
      return p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6 animate-pulse mt-8">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-10 px-4 sm:px-6 font-sans pb-24 space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {toastMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 px-6 py-3.5 rounded-full shadow-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0F766E] dark:text-teal-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          </div>
        )}

        {/* Clean SaaS Header (Stripe/Linear style) */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400 font-bold text-xs border border-teal-200/60 dark:border-teal-800/50 shadow-2xs">
              <Package className="w-3.5 h-3.5" />
              <span>Order & Return Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Your Orders & Instant Returns
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Track active shipments, initiate 3-step AI vision condition checks, or request immediate doorstep driver resolution.
            </p>
          </div>
          
          {credits > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white rounded-xl p-4 px-5 shadow-2xs border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shrink-0">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/80 rounded-xl text-[#0F766E] dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">ReLife Green Credits</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-1">{credits} pts</p>
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Sub-Navigation & Search Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button 
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "orders" ? "bg-[#0F766E] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab("returns")}
              className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "returns" ? "bg-[#0F766E] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Returns & Refunds</span>
            </button>
            <button 
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "cancelled" ? "bg-[#0F766E] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Cancelled Orders
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders by item title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition shadow-2xs"
            />
          </div>
        </div>

        {/* Orders List in Clean SaaS Card Format */}
        {filteredOrders.length === 0 ? (
          <div className="text-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 shadow-2xs flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No items found matching this view</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">Try switching tabs or adjusting your search query above to locate your orders.</p>
            <Link href="/">
              <button className="mt-2 bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-2xs px-6 py-3 rounded-xl transition cursor-pointer">
                Explore Renewed Marketplace
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const product = Array.isArray(order.products) ? order.products[0] : order.products;
              if (!product) return null;
              
              const ret = returnsMap[product.id];
              const isKeep = ret?.ai_routing_decision?.includes("keep");
              const creditsEarned = getCreditsForDecision(ret?.ai_routing_decision || "");
              const orderNum = `ORD-${order.id.slice(0, 8)}`.toUpperCase();

              return (
                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all rounded-2xl overflow-hidden">
                  
                  {/* Card Top Details Header */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Date</span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Value</span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          ₹{(product.original_price || 14500).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivery Recipient</span>
                        <span className="text-slate-900 dark:text-white font-bold">Abhnish Kumar</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Reference</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">#{orderNum}</span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-6">
                    
                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#0F766E] dark:text-teal-400 shrink-0" />
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                          Delivered • Handed directly to resident
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {ret ? (
                          <>
                            <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold px-3 py-1 text-xs shadow-2xs">
                              ⚡ AI Return Initiated
                            </Badge>
                            <Badge className="bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold px-3 py-1 text-xs shadow-2xs">
                              ✓ Verified Condition
                            </Badge>
                          </>
                        ) : (
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold px-3 py-1 text-xs shadow-2xs">
                            Eligible for Instant Doorstep Return
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Main Product Details & Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                      
                      {/* Left Product Image & Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700 p-2 shadow-2xs">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">No Image</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Link href={`/product/${product.id}`} className="font-bold text-base text-slate-900 dark:text-white hover:text-[#0F766E] dark:hover:text-teal-400 transition line-clamp-2 leading-snug">
                            {product.title}
                          </Link>
                          
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Category: <span className="text-slate-800 dark:text-slate-200 font-bold">{product.category || "Renewed Electronics"}</span>
                          </p>

                          <p className="text-xs text-[#0F766E] dark:text-teal-400 font-bold flex items-center gap-1 pt-1">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Return window active • Doorstep AI inspection ready</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Primary Action Button Stack (Teal #0F766E) */}
                      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2.5">
                        {!ret ? (
                          <Link href={`/returns/new?productId=${product.id}`} className="w-full block">
                            <button className="w-full bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl py-3.5 px-4 shadow-2xs cursor-pointer flex items-center justify-center gap-2 transition active:scale-[0.98]">
                              <RotateCcw className="w-4 h-4" />
                              <span>Initiate Instant Return</span>
                            </button>
                          </Link>
                        ) : (
                          <Link href={`/returns/new?productId=${product.id}`} className="w-full block">
                            <button className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl py-3.5 px-4 shadow-2xs cursor-pointer flex items-center justify-center gap-2 transition active:scale-[0.98]">
                              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span>View Return Status</span>
                            </button>
                          </Link>
                        )}

                        <button className="w-full font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-xl py-3 px-4 cursor-pointer flex items-center justify-center gap-2 transition shadow-2xs">
                          <Truck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Track Package Shipment</span>
                        </button>
                      </div>
                    </div>

                    {/* Return Status Dashboard Section (If Return exists) */}
                    {ret && (
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-5 mt-2 flex flex-col gap-4 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <AlertCircle className="w-4 h-4 text-[#0F766E] shrink-0" /> 
                          <span>Return initiated {formatDistanceToNow(new Date(ret.created_at))} ago • Reason: <span className="italic font-bold text-slate-900 dark:text-white">"{ret.reason}"</span></span>
                        </div>
                        
                        {/* STATE 1: PROCESSING */}
                        {ret.status === "processing" && (
                          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4 items-center shadow-2xs">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                              <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute"></span>
                              <span className="w-3 h-3 bg-amber-500 rounded-full relative z-10"></span>
                            </div>
                            <div>
                              <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm sm:text-base">🤖 Evaluated by Amazon Bedrock • Nova Pro Vision AI — Analyzing return capture...</h4>
                              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mt-0.5">Automated 100-point vision inspection usually completes in under 60 seconds.</p>
                            </div>
                          </div>
                        )}

                        {/* STATE 2: INSPECTED / DECISION READY */}
                        {ret.status === "inspected" && ret.ai_routing_decision && (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4 shadow-2xs">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center shrink-0 font-bold text-sm">✓</div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2 flex-wrap">
                                  <span>AI Resolution Decision Ready</span>
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200">🤖 Evaluated by Amazon Bedrock • Nova Pro Vision AI</span>
                                </h4>
                                <p className="text-sm font-bold text-[#0F766E] dark:text-teal-400 mt-0.5">{getDecisionText(ret.ai_routing_decision, ret.flaws_json?.refund_offer_amount)}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">{ret.flaws_json?.routing_reasoning}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {creditsEarned > 0 && (
                                <Badge className="bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold px-3 py-1 text-xs">
                                  <Sparkles className="w-3 h-3 mr-1 inline-block" />
                                  +{creditsEarned} Green Credits upon completion
                                </Badge>
                              )}
                              {isKeep && (
                                <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold px-3 py-1 text-xs">
                                  <Cloud className="w-3 h-3 mr-1 inline-block text-blue-500" />
                                  Saves 2.4 kg CO₂ by avoiding reverse logistics freight
                                </Badge>
                              )}
                            </div>

                            {isKeep && ret.flaws_json?.offer_sent_to_buyer ? (
                              <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-3">
                                <div className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-4 rounded-xl shadow-2xs">
                                  <h4 className="font-bold text-[#0F766E] dark:text-teal-300 text-base sm:text-lg flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Instant Partial Refund Offer Received!
                                  </h4>
                                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                                    The seller has offered an immediate refund of <strong className="font-black text-slate-900 dark:text-white text-base">₹{ret.flaws_json.refund_offer_amount}</strong> to keep the item. Accepting this offer avoids return transit emissions and credits your account instantly!
                                  </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <button 
                                    onClick={() => handleAcceptDecision(ret)}
                                    disabled={actionLoadingId === ret.id}
                                    className="bg-[#0F766E] hover:bg-teal-700 text-white font-bold flex-1 py-3.5 px-6 text-sm rounded-xl shadow-2xs cursor-pointer transition active:scale-[0.98]"
                                  >
                                    {actionLoadingId === ret.id ? "Processing..." : `Accept ₹${ret.flaws_json.refund_offer_amount} Instant Refund`}
                                  </button>
                                  <button 
                                    onClick={() => handleStandardRefund(ret)}
                                    disabled={actionLoadingId === ret.id}
                                    className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex-1 py-3.5 px-6 rounded-xl cursor-pointer transition"
                                  >
                                    Decline & Proceed with Standard Return
                                  </button>
                                </div>
                              </div>
                            ) : isKeep && !ret.flaws_json?.offer_sent_to_buyer ? (
                              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                                <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                  <Clock className="w-4 h-4 animate-spin text-[#0F766E]" />
                                  <span>Generating instant seller offer... Action buttons will appear shortly.</span>
                                </p>
                              </div>
                            ) : null}

                            {actionErrorId?.id === ret.id && (
                              <div className="flex items-center gap-2 text-red-600 text-xs font-bold mt-2">
                                <AlertCircle className="w-4 h-4" /> {actionErrorId?.msg}
                              </div>
                            )}
                          </div>
                        )}

                        {/* STATE 3: ACCEPTED */}
                        {ret.status === "accepted" && (
                          <div className="bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl p-4 flex gap-4 items-center shadow-2xs">
                            <CheckCircle2 className="w-8 h-8 text-[#0F766E] dark:text-teal-400 shrink-0" />
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Refund Offer Accepted & Credited</h4>
                              <p className="text-xs font-bold text-[#0F766E] dark:text-teal-300 mt-0.5">+{creditsEarned} Green Credits added to your balance.</p>
                            </div>
                          </div>
                        )}

                        {/* STATE 3.5: STANDARD REFUND REQUESTED */}
                        {ret.status === "standard_refund" && (
                          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-4 items-center shadow-2xs">
                            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Standard Doorstep Pickup Scheduled</h4>
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">Please present item as-is. Doorstep QR verification code sent to your registered email.</p>
                            </div>
                          </div>
                        )}

                        {/* STATE 4: COMPLETED */}
                        {(ret.status === "relisted" || ret.status === "rejected" || ret.status === "completed") && (
                          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-4 items-center shadow-2xs">
                            <CheckCircle2 className="w-8 h-8 text-[#0F766E] dark:text-teal-400 shrink-0" />
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Return Fully Processed</h4>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{getCompletedOutcomeText(ret)}</p>
                              {creditsEarned > 0 && ret.status !== "rejected" && (
                                <p className="text-xs font-bold text-[#0F766E] dark:text-teal-400 mt-1.5 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  +{creditsEarned} Green Credits awarded
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
