"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Cloud, Sparkles, Clock, AlertCircle, Zap,
  Loader2, Package, Truck, Activity, XCircle
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
      // In a real app, you might set a different status for accepted offers.
      // For the demo, setting it to completed means it is resolved.
      const { error } = await supabase
        .from("returns")
        .update({ status: "completed" })
        .eq("id", ret.id);

      if (error) throw error;

      setReturnsMap(prev => ({
        ...prev,
        [ret.product_id]: { ...prev[ret.product_id], status: "completed" }
      }));

      setToastMsg("Offer accepted! Return resolved.");
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

  const renderPipeline = (ret: any, isKeep: boolean) => {
    let steps: string[];
    let activeStepIndex: number; // 0-based
    let isCompleted = false;

    if (isKeep) {
      steps = ["Requested", "Approved", "Refund"];
      if (ret.status === "processing") activeStepIndex = 0;
      else if (ret.status === "inspected") activeStepIndex = 2; // Approved is done, waiting on Refund action
      else if (["completed", "relisted", "rejected", "standard_refund"].includes(ret.status)) {
        activeStepIndex = 2;
        isCompleted = true;
      }
      else activeStepIndex = 1;
    } else {
      steps = ["Requested", "Approved", "Pick Up", "Refund"];
      if (ret.status === "processing") activeStepIndex = 0;
      else if (ret.status === "inspected") activeStepIndex = 2; // Approved is done, waiting on Pick Up
      else if (ret.status === "accepted" && !ret.warehouse_confirmed_at) activeStepIndex = 3; // Pick Up is done, waiting on Refund/Warehouse
      else if (ret.status === "accepted" && ret.warehouse_confirmed_at) activeStepIndex = 3;
      else if (["completed", "relisted", "rejected", "standard_refund"].includes(ret.status)) {
        activeStepIndex = 3;
        isCompleted = true;
      }
      else activeStepIndex = 2;
    }

    return (
      <div className="flex items-center gap-1.5 w-full mt-6 mb-2 px-2">
        {steps.map((label, i) => {
          let barClass = "bg-slate-200";
          let textClass = "text-slate-400";

          if (i < activeStepIndex || (i === activeStepIndex && isCompleted)) {
            // Done -> Blue
            barClass = "bg-blue-600";
            textClass = "text-blue-800";
          } else if (i === activeStepIndex && !isCompleted) {
            // Active -> Yellow (Amber)
            barClass = "bg-amber-400";
            textClass = "text-amber-700";
          }

          return (
            <div key={i} className="flex-1 flex flex-col gap-2">
              <div className={`h-1.5 rounded-full w-full transition-all duration-500 ${barClass}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${textClass}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    );
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-slate-500 mt-1">Manage your recent orders and track returns.</p>
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
                        // eslint-disable-next-line @next/next/no-img-element
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
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                            {order.status?.toLowerCase() === 'completed' ? 'Delivered' : order.status}
                          </span>
                          {order.status?.toLowerCase() === 'completed' && (
                            <span className="text-xs font-medium text-slate-500">
                              on {new Date(new Date(order.created_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                                month: "short", day: "numeric", year: "numeric"
                              })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!ret && (
                      <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
                        <Link href={`/returns/new?productId=${product.id}`}>
                          <Button variant="outline" className="font-bold w-full border-slate-300">Return Item</Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Return Status Section */}
                  {ret && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" /> 
                          <span>Return requested {formatDistanceToNow(new Date(ret.created_at))} ago for reason: <span className="italic text-slate-700">"{ret.reason}"</span></span>
                        </div>
                        {ret.flaws_json?.auto_approved && (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                            <Zap className="w-3 h-3 fill-current" /> Auto-Approved
                          </Badge>
                        )}
                      </div>
                      
                      {renderPipeline(ret, isKeep)}

                      {/* STATE 1: PROCESSING */}
                      {ret.status === "processing" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                          </div>
                          <div>
                            <h4 className="font-bold text-amber-900 text-base">AI is analyzing your return</h4>
                            <p className="text-xs font-medium text-amber-700/80 mt-1">Usually takes under 60 seconds</p>
                          </div>
                        </div>
                      )}

                      {/* STATE 2: INSPECTED / DECISION READY */}
                      {ret.status === "inspected" && (
                        <>
                          {isKeep && ret.flaws_json?.offer_sent_to_buyer ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                  <Sparkles className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <h4 className="font-black text-emerald-950 text-lg">Partial Refund Offer</h4>
                                  <p className="text-emerald-800 mt-1 text-sm font-medium">
                                    The seller has offered you a refund of <span className="font-black">₹{ret.flaws_json.refund_offer_amount}</span> to keep the item.
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                                <Button
                                  onClick={() => handleAcceptDecision(ret)}
                                  disabled={actionLoadingId === ret.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-1 py-6 text-sm"
                                >
                                  {actionLoadingId === ret.id ? "Processing..." : `Accept ₹${ret.flaws_json.refund_offer_amount} Refund`}
                                </Button>
                                <Button
                                  onClick={() => handleStandardRefund(ret)}
                                  disabled={actionLoadingId === ret.id}
                                  variant="outline"
                                  className="font-bold text-slate-600 bg-white flex-1 py-6 border-slate-300"
                                >
                                  Decline & Proceed with Return
                                </Button>
                              </div>
                              {actionErrorId?.id === ret.id && (
                                <div className="flex items-center gap-2 text-red-600 text-sm font-bold mt-2">
                                  <AlertCircle className="w-4 h-4" /> {actionErrorId?.msg}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-blue-900 text-base">Pickup Scheduled</h4>
                                <p className="text-xs font-medium text-blue-700 mt-1">Our agent will pick up the item at your doorstep for verification.</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* STATE 3: ACCEPTED (PICKED UP) */}
                      {ret.status === "accepted" && !ret.warehouse_confirmed_at && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-indigo-900 text-base">Picked Up — In Transit</h4>
                            <p className="text-xs font-medium text-indigo-700 mt-1">Your item is on its way to our inspection warehouse.</p>
                          </div>
                        </div>
                      )}

                      {/* STATE 4: WAREHOUSE (ACCEPTED + WAREHOUSE CONFIRMED) */}
                      {ret.status === "accepted" && ret.warehouse_confirmed_at && (
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-teal-900 text-base">Warehouse Inspection in Progress</h4>
                            <p className="text-xs font-medium text-teal-700 mt-1">Our experts are verifying the item's condition to finalize the refund.</p>
                          </div>
                        </div>
                      )}

                      {/* STATE 5: STANDARD REFUND REQUESTED */}
                      {ret.status === "standard_refund" && (
                        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-base">Pending Return Shipment</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">Please ship the item back to the seller. Your refund will be issued upon receipt.</p>
                          </div>
                        </div>
                      )}

                      {/* STATE 6: COMPLETED (RELISTED OR REJECTED OR JUST COMPLETED) */}
                      {(ret.status === "relisted" || ret.status === "completed") && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-900 text-base">Refund Completed</h4>
                            <p className="text-xs font-medium text-emerald-700 mt-1">Your return has been finalized and the refund was issued to your original payment method.</p>
                          </div>
                        </div>
                      )}

                      {ret.status === "rejected" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <XCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-red-900 text-base">Return Declined</h4>
                            <p className="text-xs font-medium text-red-700 mt-1">Inspection found a discrepancy. The item will be returned to you.</p>
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
