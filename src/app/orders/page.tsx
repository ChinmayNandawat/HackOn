"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOrCreateSessionId } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Cloud, Sparkles, Clock, AlertCircle, Zap } from "lucide-react";
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
        .select("*, products(id, title, image_url, category)")
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



  const getCompletedOutcomeText = (ret: any) => {
    if (ret.status === "relisted") return "Your return was accepted, and the item has been listed as refurbished to find a new home.";
    if (ret.ai_routing_decision === "donate") return "Your return was processed, and your item was successfully donated to a local charity.";
    if (ret.ai_routing_decision === "recycle") return "Your return was processed, and the item was responsibly recycled.";
    if (ret.ai_routing_decision?.includes("keep")) return "You kept the item and received a partial refund. Thank you for reducing carbon emissions!";
    if (ret.status === "rejected") return "Your return request was declined after inspection.";
    return "Your return has been fully processed and a refund has been issued.";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse mt-8">
        <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
        <div className="h-48 bg-slate-200 rounded-2xl w-full"></div>
        <div className="h-48 bg-slate-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8 font-sans pb-24">
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            {toastMsg}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-slate-500">Manage your recent orders and returns.</p>
            {/* Subtle Demo Toggle */}
            <select
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              value={typeof window !== 'undefined' ? localStorage.getItem("DEMO_TRUST_OVERRIDE") || "" : ""}
              onChange={(e) => {
                if (e.target.value) {
                  localStorage.setItem("DEMO_TRUST_OVERRIDE", e.target.value);
                } else {
                  localStorage.removeItem("DEMO_TRUST_OVERRIDE");
                }
                // Force a tiny visual update if needed, but since it's just for returns/new it's fine.
                window.location.reload();
              }}
            >
              <option value="">Auto Trust Score</option>
              <option value="95">Force High Trust (95%)</option>
              <option value="75">Force Med Trust (75%)</option>
              <option value="40">Force Low Trust (40%)</option>
            </select>
          </div>
        </div>
        
        {credits > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 px-4 shadow-sm flex flex-col items-center">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Green Credits
            </p>
            <p className="text-2xl font-black text-emerald-700 leading-none">{credits}</p>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
          <Link href="/">
            <Button className="mt-4 bg-slate-900 text-white font-bold">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const product = Array.isArray(order.products) ? order.products[0] : order.products;
            if (!product) return null;
            
            const ret = returnsMap[product.id];
            const isKeep = ret?.ai_routing_decision?.includes("keep");

            return (
              <Card key={order.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex flex-col">
                  {/* Order Top Section */}
                  <div className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">No Image</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{product.category || "Product"}</p>
                      <h3 className="font-black text-lg text-slate-900 leading-tight mt-0.5 truncate">{product.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Ordered on {new Date(order.created_at).toLocaleDateString("en-IN", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </p>
                      
                      {!ret && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                          {order.status}
                        </span>
                      )}
                    </div>
                    
                    {!ret && (
                       <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
                         <Link href={`/returns/new?productId=${product.id}`}>
                           <Button variant="outline" className="font-bold w-full">Return Item</Button>
                         </Link>
                       </div>
                    )}
                  </div>
                  
                  {/* Return Status Section */}
                  {ret && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <AlertCircle className="w-4 h-4" /> 
                        <span>Return requested {formatDistanceToNow(new Date(ret.created_at))} ago for reason: <span className="italic text-slate-700">"{ret.reason}"</span></span>
                      </div>
                      
                      {/* Auto Approved Banner */}
                      {ret.flaws_json?.auto_approved && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-3 items-center shadow-sm">
                          <Zap className="w-5 h-5 text-emerald-500 fill-current shrink-0" />
                          <div>
                            <h4 className="font-black text-emerald-900 text-sm">Lightning Fast Return ⚡</h4>
                            <p className="text-xs font-bold text-emerald-700 mt-0.5">Your strong trust score means this return was automatically approved instantly.</p>
                          </div>
                        </div>
                      )}
                      
                      {/* STATE 1: PROCESSING */}
                      {ret.status === "processing" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute"></span>
                            <span className="w-3 h-3 bg-amber-500 rounded-full relative z-10"></span>
                          </div>
                          <div>
                            <h4 className="font-bold text-amber-900">AI is analyzing your return. Check back shortly.</h4>
                            <p className="text-xs font-medium text-amber-700/70 mt-1">Usually takes under 60 seconds</p>
                          </div>
                        </div>
                      )}

                      {/* STATE 2: INSPECTED / DECISION READY */}
                      {ret.status === "inspected" && ret.ai_routing_decision && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">!</div>
                            <div>
                              <h4 className="font-black text-blue-950 text-lg">Decision Ready</h4>
                              <p className="text-sm font-bold text-blue-800 mt-1">{getDecisionText(ret.ai_routing_decision, ret.flaws_json?.refund_offer_amount)}</p>
                              <p className="text-xs text-blue-600/80 mt-1">{ret.flaws_json?.routing_reasoning}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {isKeep && (
                              <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 border border-sky-200 font-bold px-3 py-1 text-xs">
                                <Cloud className="w-3 h-3 mr-1 inline-block" />
                                Saves 2.4 kg CO₂ by avoiding return shipment
                              </Badge>
                            )}
                          </div>

                          {isKeep && ret.flaws_json?.offer_sent_to_buyer ? (
                            <div className="flex flex-col gap-4 pt-4 border-t border-blue-200/50 mt-4">
                              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm">
                                <h4 className="font-black text-emerald-900 text-lg flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-emerald-600" />
                                  Partial Refund Offer Received!
                                </h4>
                                <p className="text-emerald-800 mt-1">
                                  The seller has offered you a partial refund of <span className="font-black text-xl">₹{ret.flaws_json.refund_offer_amount}</span> to keep the item. 
                                  Accepting this offer reduces carbon emissions by avoiding return shipping!
                                </p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                  onClick={() => handleAcceptDecision(ret)}
                                  disabled={actionLoadingId === ret.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-1 py-6 text-base"
                                >
                                  {actionLoadingId === ret.id ? "Processing..." : `Accept ₹${ret.flaws_json.refund_offer_amount} Refund`}
                                </Button>
                                <Button 
                                  onClick={() => handleStandardRefund(ret)}
                                  disabled={actionLoadingId === ret.id}
                                  variant="outline"
                                  className="font-bold text-slate-600 bg-white flex-1 py-6"
                                >
                                  Reject Offer (Standard Return)
                                </Button>
                              </div>
                            </div>
                          ) : isKeep && !ret.flaws_json?.offer_sent_to_buyer ? (
                            <div className="pt-4 border-t border-blue-200/50 mt-4">
                              <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                <Clock className="w-4 h-4 animate-spin-slow" />
                                Pending Seller Offer... Action buttons will appear shortly.
                              </p>
                            </div>
                          ) : null}

                          {actionErrorId?.id === ret.id && (
                            <div className="flex items-center gap-2 text-red-600 text-sm font-bold mt-2">
                              <AlertCircle className="w-4 h-4" /> {actionErrorId?.msg}
                            </div>
                          )}
                        </div>
                      )}

                      {/* STATE 3: ACCEPTED */}
                      {ret.status === "accepted" && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4 items-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                          <div>
                            <h4 className="font-black text-emerald-900">Decision Accepted</h4>
                          </div>
                        </div>
                      )}

                      {/* STATE 3.5: STANDARD REFUND REQUESTED */}
                      {ret.status === "standard_refund" && (
                        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">Standard refund requested</h4>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">Please ship the item back. Return instructions sent to email.</p>
                          </div>
                        </div>
                      )}

                      {/* STATE 4: COMPLETED (RELISTED OR REJECTED) */}
                      {(ret.status === "relisted" || ret.status === "rejected" || ret.status === "completed") && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-center">
                          <CheckCircle2 className="w-8 h-8 text-blue-500 shrink-0" />
                          <div>
                            <h4 className="font-black text-blue-900">Completed</h4>
                            <p className="text-sm font-bold text-blue-700 mt-0.5">{getCompletedOutcomeText(ret)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
