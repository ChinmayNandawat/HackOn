"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOrCreateSessionId } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Cloud, Sparkles, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type ReturnRecord = any;

export default function BuyerReturnsPage() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionErrorId, setActionErrorId] = useState<{ id: string; msg: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const sessionId = getOrCreateSessionId();
      
      // Fetch impact stats
      try {
        const impactRes = await fetch(`/api/impact?sessionId=${sessionId}`);
        if (impactRes.ok) {
          const impactData = await impactRes.json();
          setCredits(impactData.personal?.total_credits || 0);
        }
      } catch (err) {
        console.error("Failed to fetch impact", err);
      }

      // Fetch returns
      const { data, error } = await supabase
        .from('returns')
        .select('*, products(title, original_price, category, image_url)')
        .eq('buyer_id', '00000000-0000-0000-0000-000000000002')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReturns(data);
      }
      setLoading(false);
    }
    
    loadData();
  }, []);

  const handleAcceptDecision = async (ret: ReturnRecord) => {
    setActionLoadingId(ret.id);
    setActionErrorId(null);
    
    try {
      const sessionId = getOrCreateSessionId();
      let actionType = 'return_processed';
      if (ret.routing_decision?.includes('keep')) {
        actionType = 'keep_and_refund';
      } else if (ret.routing_decision === 'donate') {
        actionType = 'donate';
      }

      // 1. Log impact
      await fetch('/api/impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          actionType,
          productId: ret.product_id
        })
      });

      // 2. Update DB
      const { error } = await supabase
        .from('returns')
        .update({ status: 'accepted' })
        .eq('id', ret.id);

      if (error) throw error;

      // 3. Update local state
      setReturns(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'accepted' } : r));
      setToastMsg("Decision accepted! Green Credits added to your account 🌱");
      
      // Refresh credits
      const impactRes = await fetch(`/api/impact?sessionId=${sessionId}`);
      if (impactRes.ok) {
        const impactData = await impactRes.json();
        setCredits(impactData.personal?.total_credits || 0);
      }

      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setActionErrorId({ id: ret.id, msg: err.message || "Failed to accept decision. Please try again." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStandardRefund = async (ret: ReturnRecord) => {
    setActionLoadingId(ret.id);
    setActionErrorId(null);
    
    try {
      const { error } = await supabase
        .from('returns')
        .update({ status: 'standard_refund' })
        .eq('id', ret.id);

      if (error) throw error;

      setReturns(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'standard_refund' } : r));
    } catch (err: any) {
      console.error(err);
      setActionErrorId({ id: ret.id, msg: err.message || "Failed to request refund." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDecisionText = (decision: string) => {
    if (decision === 'relist_as_refurbished') return "Return approved — please ship the item back";
    if (decision === 'needs_repair_then_relist') return "Return approved — please ship the item back for refurbishment";
    if (decision === 'keep_and_refund' || decision === 'keep_refund') return "Keep your item — a partial refund will be issued to your account";
    if (decision === 'donate') return "Your item will be donated to a good cause — thank you.";
    return "Return processed.";
  };

  const getCreditsForDecision = (decision: string) => {
    if (decision === 'keep_and_refund' || decision === 'keep_refund') return 50;
    if (decision === 'donate') return 80;
    return 10;
  };

  const getCompletedOutcomeText = (ret: ReturnRecord) => {
    if (ret.status === 'relisted') return "Your return was accepted, and the item has been listed as refurbished to find a new home.";
    if (ret.routing_decision === 'donate') return "Your return was processed, and your item was successfully donated to a local charity.";
    if (ret.routing_decision === 'recycle') return "Your return was processed, and the item was responsibly recycled.";
    if (ret.routing_decision?.includes('keep')) return "You kept the item and received a partial refund. Thank you for reducing carbon emissions!";
    if (ret.status === 'rejected') return "Your return request was declined after inspection.";
    return "Your return has been fully processed and a refund has been issued.";
  };

  // derived state
  const pendingCount = returns.filter(r => r.status === 'processing' || r.status === 'inspected').length;

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
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 font-sans pb-24">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            {toastMsg}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Returns</h1>
        <p className="text-slate-500 mt-1">Track the status of your requested returns and AI routing decisions.</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Returns</p>
            <p className="text-2xl font-black text-slate-900">{returns.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Decisions</p>
            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Green Credits
            </p>
            <p className="text-2xl font-black text-emerald-700">{credits}</p>
          </CardContent>
        </Card>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-4 font-medium">No returns yet.</p>
          <Link href="/returns/new" className="text-blue-600 font-bold hover:underline">
            Start a return from My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map(ret => {
            const product = ret.products;
            const thumb = ret.image_urls?.[0] || product?.image_url;
            const daysAgo = formatDistanceToNow(new Date(ret.created_at));
            const isKeep = ret.routing_decision?.includes('keep');
            const creditsEarned = getCreditsForDecision(ret.routing_decision);

            return (
              <Card key={ret.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6 md:flex gap-6">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mb-4 md:mb-0 hidden sm:block">
                      {thumb ? (
                        <img src={thumb} alt={product?.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{product?.category || "Product"}</p>
                            <h3 className="text-lg font-black text-slate-900 leading-tight mt-1">{product?.title || "Unknown Item"}</h3>
                          </div>
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Submitted {daysAgo} ago
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-md italic border border-slate-100">
                          &quot;{ret.return_reason}&quot;
                        </p>
                      </div>

                      {/* Status Indicator Area */}
                      <div className="border-t border-slate-100 pt-4 mt-4">
                        
                        {/* STATE 1: PROCESSING */}
                        {ret.status === 'processing' && (
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
                        {ret.status === 'inspected' && ret.routing_decision && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">!</div>
                              <div>
                                <h4 className="font-black text-blue-950 text-lg">Decision Ready</h4>
                                <p className="text-sm font-bold text-blue-800 mt-1">{getDecisionText(ret.routing_decision)}</p>
                                <p className="text-xs text-blue-600/80 mt-1">{ret.routing_reasoning}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold px-3 py-1 text-xs">
                                <Sparkles className="w-3 h-3 mr-1 inline-block" />
                                +{creditsEarned} Green Credits if you accept
                              </Badge>
                              {isKeep && (
                                <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 border border-sky-200 font-bold px-3 py-1 text-xs">
                                  <Cloud className="w-3 h-3 mr-1 inline-block" />
                                  Saves 2.4 kg CO₂ by avoiding return shipment
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-blue-200/50 mt-4">
                              <Button 
                                onClick={() => handleAcceptDecision(ret)}
                                disabled={actionLoadingId === ret.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                {actionLoadingId === ret.id ? "Processing..." : "Accept Decision"}
                              </Button>
                              <Button 
                                onClick={() => handleStandardRefund(ret)}
                                disabled={actionLoadingId === ret.id}
                                variant="outline"
                                className="font-bold text-slate-600"
                              >
                                Request Standard Refund
                              </Button>
                            </div>

                            {actionErrorId?.id === ret.id && (
                              <div className="flex items-center gap-2 text-red-600 text-sm font-bold mt-2">
                                <AlertCircle className="w-4 h-4" /> {actionErrorId?.msg}
                              </div>
                            )}
                          </div>
                        )}

                        {/* STATE 3: ACCEPTED */}
                        {ret.status === 'accepted' && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4 items-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                            <div>
                              <h4 className="font-black text-emerald-900">Decision Accepted</h4>
                              <p className="text-sm font-bold text-emerald-700 mt-0.5">+{creditsEarned} Green Credits earned</p>
                            </div>
                          </div>
                        )}

                        {/* STATE 3.5: STANDARD REFUND REQUESTED */}
                        {ret.status === 'standard_refund' && (
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
                        {(ret.status === 'relisted' || ret.status === 'rejected' || ret.status === 'completed') && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-center">
                            <CheckCircle2 className="w-8 h-8 text-blue-500 shrink-0" />
                            <div>
                              <h4 className="font-black text-blue-900">Completed</h4>
                              <p className="text-sm font-bold text-blue-700 mt-0.5">{getCompletedOutcomeText(ret)}</p>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
