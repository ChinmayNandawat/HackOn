"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { 
  Package, MapPin, ChevronRight, ArrowLeft,
  CheckCircle2, AlertTriangle, XCircle, CheckSquare, ScanLine, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Screen = "queue" | "verification" | "success";

const MobileContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-100 flex justify-center pb-20 sm:pb-0">
    <div className="w-full max-w-[480px] bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
      {children}
    </div>
  </div>
);

export default function PickupAgentApp() {
  const [screen, setScreen] = useState<Screen>("queue");
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePickup, setActivePickup] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPickups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("returns")
      .select("*, products(id, title, image_url, category)")
      .eq("status", "inspected")
      .order("created_at", { ascending: false });
      
    if (data) {
      // Filter out keep_and_refund since they don't require pickup
      const filtered = data.filter(r => {
         const decision = r.ai_routing_decision || r.routing_decision || "";
         return !decision.includes("keep");
      });
      setPickups(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleSelectPickup = (pickup: any) => {
    setActivePickup(pickup);
    setScreen("verification");
  };

  const processPickup = async (action: "accept" | "flag" | "reject") => {
    if (!activePickup) return;
    setActionLoading(true);

    try {
      let updateData: any = {};
      
      if (action === "accept") {
        updateData = { status: "accepted" };
        setSuccessMessage("Item verified and picked up successfully. Route to warehouse.");
      } else if (action === "flag") {
        updateData = { 
          status: "accepted", 
          flaws_json: { ...activePickup.flaws_json, pickup_flagged: true }
        };
        setSuccessMessage("Item picked up but flagged for mismatch. Warehouse will inspect carefully.");
      } else if (action === "reject") {
        updateData = { status: "rejected" };
        setSuccessMessage("Pickup rejected. Wrong item detected.");
      }

      const { error } = await supabase
        .from("returns")
        .update(updateData)
        .eq("id", activePickup.id);

      if (error) throw error;
      
      setScreen("success");
    } catch (err) {
      console.error(err);
      alert("Failed to process pickup. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getAWB = (id: string) => `AWB-${id.substring(0, 8).toUpperCase()}`;

  // ==========================================
  // SCREEN 1: QUEUE
  // ==========================================
  if (screen === "queue") {
    return (
      <MobileContainer>
        {/* App Header */}
        <div className="bg-blue-600 text-white pt-12 pb-6 px-6 rounded-b-3xl shadow-md z-10 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Agent ID #DEL-884</p>
              <h1 className="text-2xl font-black tracking-tight">Today's Route</h1>
            </div>
            <div className="bg-blue-500/50 p-3 rounded-full">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="bg-white/20 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm border border-white/10">
            <div>
              <p className="text-3xl font-black leading-none">{loading ? "-" : pickups.length}</p>
              <p className="text-xs font-bold text-blue-100 mt-1 uppercase tracking-wider">Pending Pickups</p>
            </div>
            <div className="h-10 w-px bg-white/20 mx-4"></div>
            <div>
              <p className="text-3xl font-black leading-none">0</p>
              <p className="text-xs font-bold text-blue-100 mt-1 uppercase tracking-wider">Completed</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-6 pb-24 bg-slate-50">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded-3xl w-full"></div>
              ))}
            </div>
          ) : pickups.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 mt-12 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">All caught up!</h3>
              <p className="text-sm text-slate-500 mt-2">There are no pending return pickups assigned to you right now.</p>
              <Button onClick={fetchPickups} variant="outline" className="mt-6 font-bold w-full rounded-2xl">
                Refresh Queue
              </Button>
            </div>
          ) : (
            pickups.map(pickup => {
              const product = Array.isArray(pickup.products) ? pickup.products[0] : pickup.products;
              const awb = getAWB(pickup.id);
              
              return (
                <div 
                  key={pickup.id} 
                  onClick={() => handleSelectPickup(pickup)}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all flex flex-col gap-4 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-0 transition-transform group-active:scale-150"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-200">
                        {awb}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(pickup.created_at))}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 items-center relative z-10">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl shrink-0 overflow-hidden border border-slate-200">
                      {product?.image_url && (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 text-base leading-tight truncate">{product?.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        123 Main St, Tech Park, BLR
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 shrink-0" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </MobileContainer>
    );
  }

  // ==========================================
  // SCREEN 2: VERIFICATION
  // ==========================================
  if (screen === "verification" && activePickup) {
    const product = Array.isArray(activePickup.products) ? activePickup.products[0] : activePickup.products;
    const awb = getAWB(activePickup.id);
    const grade = activePickup.ai_grade || activePickup.grade || "B";
    const isFastTrack = activePickup.flaws_json?.is_fast_track;

    return (
      <MobileContainer>
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 pt-10 sticky top-0 z-20 flex items-center gap-4">
          <button 
            onClick={() => setScreen("queue")}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verify Pickup</p>
            <h2 className="text-lg font-black text-slate-900">{awb}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-32">
          
          {/* Product Details */}
          <div className="flex gap-4">
             <div className="w-24 h-24 bg-slate-100 rounded-2xl shrink-0 overflow-hidden border border-slate-200">
                {product?.image_url && (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">{product?.title}</h3>
                <span className="inline-block mt-2 bg-slate-100 text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-200">
                  {product?.category || "Electronics"}
                </span>
              </div>
          </div>

          {/* AI Pre-grade block */}
          {!isFastTrack ? (
            <div className="bg-blue-50 rounded-3xl p-5 border border-blue-200 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-bl-full -z-0"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <h4 className="font-black text-blue-900 text-sm flex items-center gap-2">
                  <ScanLine className="w-4 h-4" /> AI Inspection Summary
                </h4>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  {grade}
                </div>
              </div>
              
              <p className="text-sm font-semibold text-blue-800 relative z-10">
                {activePickup.flaws_json?.buyer_description || "Customer reported minor flaws."}
              </p>
              
              {activePickup.flaws_json?.summary && (
                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl text-xs font-medium text-blue-900 relative z-10">
                  {activePickup.flaws_json.summary}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 space-y-4">
               <h4 className="font-black text-emerald-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Fast-Track Return
                </h4>
                <p className="text-sm font-semibold text-emerald-800">
                  Customer has a high trust score. No AI photo was required.
                </p>
            </div>
          )}

          {/* Checklist */}
          <div className="space-y-3 pt-2">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-400" /> Physical Checks
            </h4>
            
            <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm">
              {[
                `Item matches ${product?.title}`,
                "Original packaging is included",
                "No severe unmentioned physical damage"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0"></div>
                  <span className="text-sm font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="bg-white border-t border-slate-200 p-4 fixed bottom-0 left-0 right-0 sm:absolute max-w-[480px] mx-auto z-30 pb-safe">
          <div className="flex flex-col gap-2.5">
            <Button 
              disabled={actionLoading}
              onClick={() => processPickup("accept")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-7 rounded-2xl text-sm transition-transform active:scale-[0.98] shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Verified — Accept Pickup
            </Button>
            
            <div className="flex gap-2.5">
              <Button 
                disabled={actionLoading}
                onClick={() => processPickup("flag")}
                variant="outline"
                className="flex-1 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 font-black py-7 rounded-2xl transition-transform active:scale-[0.98]"
              >
                <AlertTriangle className="w-5 h-5 mr-1" />
                Flag
              </Button>
              <Button 
                disabled={actionLoading}
                onClick={() => processPickup("reject")}
                variant="outline"
                className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 font-black py-7 rounded-2xl transition-transform active:scale-[0.98]"
              >
                <XCircle className="w-5 h-5 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // ==========================================
  // SCREEN 3: SUCCESS
  // ==========================================
  if (screen === "success") {
    return (
      <MobileContainer>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Done!</h2>
            <p className="text-slate-600 font-medium leading-relaxed">{successMessage}</p>
          </div>

          <Button 
            onClick={() => {
              setScreen("queue");
              setActivePickup(null);
              fetchPickups();
            }}
            className="w-full max-w-[240px] bg-slate-900 text-white font-bold py-6 rounded-2xl mt-8"
          >
            Back to Queue
          </Button>
        </div>
      </MobileContainer>
    );
  }

  return null;
}
