"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  MapPin, ChevronRight, ArrowLeft,
  CheckCircle2, AlertTriangle, XCircle, CheckSquare, ScanLine, Clock, Package, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import AnnotatedImage from "@/components/AnnotatedImage";
import { PickupScanner } from "@/components/PickupScanner";

type Screen = "queue" | "verification" | "success";

// Temporary dummy data for UI testing
const DUMMY_PICKUPS = [
  {
    id: "uuid-1111-aaaa",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "inspected",
    ai_grade: "B",
    flaws_json: {
      seller_approved: true,
      buyer_description: "Zipper on the front pocket is stuck.",
      summary: "Detected issue with front zipper mechanism. Fabric is pristine.",
      is_fast_track: false,
      return_photo_urls: ["https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png"],
      flaws: [
        { name: "Zipper Stuck", severity: "minor", image_index: 0, x_percent: 50, y_percent: 60, width_percent: 15, height_percent: 10 }
      ]
    },
    products: { title: "Fjallraven - Foldsack No. 1 Backpack", category: "Bags", image_url: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png" }
  },
  {
    id: "uuid-2222-bbbb",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "inspected",
    ai_grade: "A",
    flaws_json: {
      auto_approved: true,
      buyer_description: "Size is too small, never worn.",
      is_fast_track: true,
      return_photo_urls: ["https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png"]
    },
    products: { title: "Mens Casual Slim Fit T-Shirt", category: "Apparel", image_url: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png" }
  },
  {
    id: "uuid-3333-cccc",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    status: "inspected",
    ai_grade: "C",
    flaws_json: {
      seller_approved: true,
      buyer_description: "Button is missing on the left cuff.",
      summary: "Cuff button missing. Slight fraying around the buttonhole.",
      is_fast_track: false,
      return_photo_urls: ["https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png"],
      flaws: [
        { name: "Missing Button", severity: "major", image_index: 0, x_percent: 20, y_percent: 80, width_percent: 10, height_percent: 10 }
      ]
    },
    products: { title: "Mens Cotton Jacket", category: "Apparel", image_url: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png" }
  },
  {
    id: "uuid-4444-dddd",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "inspected",
    ai_grade: "A",
    flaws_json: {
      auto_approved: true,
      buyer_description: "Ordered wrong color.",
      summary: "Item is in pristine condition. No visible wear.",
      is_fast_track: false,
      return_photo_urls: ["https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png"],
      flaws: []
    },
    products: { title: "Womens Winter Coat", category: "Apparel", image_url: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png" }
  },
  {
    id: "uuid-5555-eeee",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: "inspected",
    ai_grade: "B",
    flaws_json: {
      seller_approved: true,
      buyer_description: "Small stain on the sleeve.",
      summary: "Detected 1 minor stain (0.5cm) on the left sleeve. Otherwise flawless.",
      is_fast_track: false,
      return_photo_urls: ["https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png"],
      flaws: [
        { name: "Sleeve Stain", severity: "minor", image_index: 0, x_percent: 80, y_percent: 50, width_percent: 10, height_percent: 10 }
      ]
    },
    products: { title: "Womens Short Sleeve T-Shirt", category: "Apparel", image_url: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png" }
  },
  {
    id: "uuid-6666-ffff",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "inspected",
    ai_grade: "B",
    flaws_json: {
      auto_approved: true,
      buyer_description: "Ring size is too large.",
      summary: "Slight micro-scratches on the band. Stones are secure.",
      is_fast_track: false,
      return_photo_urls: ["https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png"],
      flaws: [
        { name: "Micro-scratches", severity: "moderate", image_index: 0, x_percent: 50, y_percent: 50, width_percent: 25, height_percent: 25 }
      ]
    },
    products: { title: "Solid Gold Petite Micropave Ring", category: "Jewelry", image_url: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png" }
  }
];

export default function PickupAgentApp() {
  const [screen, setScreen] = useState<Screen>("queue");
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePickup, setActivePickup] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedAwb, setScannedAwb] = useState("");
  const [expandedImage, setExpandedImage] = useState<any | null>(null);

  // Interactive Checklist States
  const [aiChecks, setAiChecks] = useState<Record<string, boolean>>({});
  const [physicalChecks, setPhysicalChecks] = useState<Record<number, boolean>>({});
  const [agentDecision, setAgentDecision] = useState<"match" | "mismatch" | "wrong_item" | null>(null);

  const fetchPickups = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("returns")
        .select("*, products(id, title, image_url, category)")
        .eq("status", "inspected")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const filtered = data.filter(r => {
           const isApproved = r.flaws_json?.auto_approved || r.flaws_json?.seller_approved;
           const decision = r.ai_routing_decision || r.routing_decision || "";
           return isApproved && !decision.includes("keep");
        });
        
        // Append dummy data to real data to ensure the UI feels populated for demo purposes
        setPickups([...filtered, ...DUMMY_PICKUPS]);
      }
    } catch (err) {
      console.error(err);
      setPickups(DUMMY_PICKUPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleSelectPickup = (pickup: any) => {
    setActivePickup(pickup);
    setCurrentImageIndex(0);
    setAiChecks({});
    setPhysicalChecks({});
    setAgentDecision(null);
    setScreen("verification");
  };

  const processPickup = async () => {
    if (!activePickup || !agentDecision) return;
    setActionLoading(true);

    try {
      if (agentDecision === "match") {
        setSuccessMessage("Item verified and picked up successfully. Route to warehouse.");
      } else if (agentDecision === "mismatch") {
        setSuccessMessage("Item picked up but flagged for warehouse inspection due to discrepancies.");
      } else if (agentDecision === "wrong_item") {
        setSuccessMessage("Pickup rejected. Wrong item or severe condition mismatch.");
      }
      
      const isDummy = activePickup.id.startsWith("uuid-");
      
      if (!isDummy) {
        let updateData: any = {};
        if (agentDecision === "match") {
          updateData = { status: "accepted" };
        }
        else if (agentDecision === "mismatch") updateData = { status: "accepted", flaws_json: { ...activePickup.flaws_json, pickup_flagged: true } };
        else if (agentDecision === "wrong_item") updateData = { status: "rejected" };

        const { error } = await supabase.from("returns").update(updateData).eq("id", activePickup.id);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 800)); // simulate network delay for dummy
      }

      // Remove from queue locally
      setPickups(prev => prev.filter(p => p.id !== activePickup.id));
      setScreen("success");
    } catch (err) {
      console.error(err);
      alert("Failed to process pickup.");
    } finally {
      setActionLoading(false);
    }
  };

  const getAWB = (pickup: any) => pickup.flaws_json?.awb_override || `AWB-${pickup.id.substring(0, 8).toUpperCase()}`;

  // CSS classes for responsive layout
  // On Mobile: Only one section is visible at a time
  // On Desktop: Split screen (Queue on left, Details on right)
  
  const isQueueVisible = screen === "queue" || screen === "success";
  const isDetailsVisible = screen === "verification" || screen === "success";

  // Variables for Annotated Image Carousel
  const return_photo_urls = activePickup?.return_photo_urls || activePickup?.flaws_json?.return_photo_urls || [];
  const displayImages = return_photo_urls.length > 0 ? return_photo_urls : [activePickup?.products?.image_url || ''];
  const currentImageUrl = displayImages[currentImageIndex] || displayImages[0];
  const flawsToDraw = (activePickup?.flaws_json?.flaws || []).filter((f: any) => f.image_index === currentImageIndex || (f.image_index === undefined && currentImageIndex === 0));

  return (
    <div className="min-h-screen bg-slate-200 md:p-6 lg:p-8 flex justify-center font-sans">
      <div className="w-full max-w-[1200px] bg-slate-50 md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative min-h-screen md:min-h-[85vh]">
        
        {/* ==========================================
            LEFT PANEL: QUEUE 
            ========================================== */}
        <div className={`w-full md:w-[400px] lg:w-[450px] bg-slate-50 flex flex-col border-r border-slate-200 ${isQueueVisible ? 'flex' : 'hidden md:flex'}`}>
          
          <div className="bg-blue-600 text-white pt-10 md:pt-8 pb-6 px-6 md:rounded-tl-[2.5rem] shadow-sm z-10 shrink-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Agent ID #DEL-884</p>
                <h1 className="text-2xl font-black tracking-tight">Today's Route</h1>
              </div>
              <button 
                onClick={() => setScannerOpen(true)}
                className="bg-blue-500/50 p-3 rounded-full hover:bg-blue-400 transition-colors cursor-pointer active:scale-95"
              >
                <ScanLine className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md border border-white/20">
              <div>
                <p className="text-3xl font-black leading-none">{loading ? "-" : pickups.length}</p>
                <p className="text-[10px] font-bold text-blue-100 mt-1 uppercase tracking-widest">Pending Pickups</p>
              </div>
              <div className="h-10 w-px bg-white/20 mx-4"></div>
              <div>
                <p className="text-3xl font-black leading-none">0</p>
                <p className="text-[10px] font-bold text-blue-100 mt-1 uppercase tracking-widest">Completed</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-5 pb-24 md:pb-5 bg-slate-100/50">
            {loading ? (
              <div className="space-y-4 animate-pulse px-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-slate-200 rounded-3xl w-full"></div>
                ))}
              </div>
            ) : pickups.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 mt-12 bg-white rounded-3xl border border-dashed border-slate-300 mx-2">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">All caught up!</h3>
                <p className="text-xs text-slate-500 mt-2">No pending return pickups assigned.</p>
                <Button onClick={fetchPickups} variant="outline" className="mt-6 font-bold w-full rounded-2xl h-12 text-blue-600 border-blue-200 hover:bg-blue-50">
                  Refresh Queue
                </Button>
              </div>
            ) : (
              pickups.map(pickup => {
                const product = Array.isArray(pickup.products) ? pickup.products[0] : pickup.products;
                const awb = getAWB(pickup);
                const isActive = activePickup?.id === pickup.id;
                
                return (
                  <div 
                    key={pickup.id} 
                    onClick={() => handleSelectPickup(pickup)}
                    className={`rounded-3xl p-4 cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden group border ${
                      isActive 
                        ? 'bg-blue-50 border-blue-300 shadow-md ring-4 ring-blue-50' 
                        : 'bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                          isActive ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-800'
                        }`}>
                          {awb}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(pickup.created_at))}
                      </span>
                    </div>
                    
                    <div className="flex gap-3 items-center relative z-10">
                      <div className="w-14 h-14 bg-white rounded-2xl shrink-0 overflow-hidden border border-slate-200 p-1">
                        {product?.image_url && (
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-black text-sm leading-tight truncate ${isActive ? 'text-blue-950' : 'text-slate-900'}`}>{product?.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate font-medium">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          Tech Park, Sector 4
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-300'}`} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ==========================================
            RIGHT PANEL: DETAILS / SUCCESS
            ========================================== */}
        <div className={`flex-1 flex flex-col bg-slate-50 relative ${isDetailsVisible ? 'flex' : 'hidden md:flex'}`}>
          
          {screen === "success" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 shadow-xl shadow-emerald-100">
                <CheckCircle2 className="w-14 h-14 text-emerald-600" />
              </div>
              
              <div className="space-y-3 max-w-sm">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Done!</h2>
                <p className="text-slate-600 font-medium leading-relaxed">{successMessage}</p>
              </div>

              <Button 
                onClick={() => {
                  setScreen("queue");
                  setActivePickup(null);
                }}
                className="w-full max-w-[240px] bg-slate-900 hover:bg-slate-800 text-white font-black py-7 rounded-2xl mt-8 shadow-lg md:hidden"
              >
                Back to Queue
              </Button>
            </div>
          ) : !activePickup ? (
            // Desktop empty state
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                <Package className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl">Select a Pickup</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">Tap a return on the left to view verification details and process the item.</p>
            </div>
          ) : (
            // Verification details
            <>
              {/* Mobile Header (Hidden on desktop since queue is visible) */}
              <div className="bg-white border-b border-slate-200 p-4 pt-10 sticky top-0 z-20 flex items-center gap-4 md:hidden">
                <button 
                  onClick={() => setScreen("queue")}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verify Pickup</p>
                  <h2 className="text-lg font-black text-slate-900">{getAWB(activePickup)}</h2>
                </div>
              </div>

              {/* Desktop Header */}
              <div className="hidden md:block bg-white border-b border-slate-200 p-8">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Return Verification</p>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">{getAWB(activePickup)}</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 pb-40 md:pb-32">
                
                <div className="flex flex-col gap-6">
                   {/* AI Evidence Carousel & Image-Specific Checklist */}
                   {currentImageUrl && (
                     <div className="w-full max-w-sm mx-auto bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
                         <div 
                           className="relative group p-2 flex justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-[2rem]"
                           onClick={() => setExpandedImage({ url: currentImageUrl, imageFlaws: flawsToDraw, originalIndex: currentImageIndex })}
                         >
                           <AnnotatedImage imageUrl={currentImageUrl} flaws={flawsToDraw} width={300} height={300} />
                          
                          {displayImages.length > 1 && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1)); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-slate-800 transition-colors z-20 cursor-pointer"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1)); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-slate-800 transition-colors z-20 cursor-pointer"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                                {displayImages.map((_: any, idx: number) => (
                                  <div key={idx} className={`w-2 h-2 rounded-full transition-colors shadow-sm ${idx === currentImageIndex ? "bg-blue-600" : "bg-white/80 border border-slate-300"}`} />
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Image-Specific Checklist */}
                        {flawsToDraw.length > 0 ? (
                          <div className="bg-blue-50/50 p-4 border-t border-slate-100">
                            <h4 className="font-black text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                              <ScanLine className="w-3.5 h-3.5 text-blue-500" /> Verify flaws in this image
                            </h4>
                            <div className="space-y-2">
                              {flawsToDraw.map((flaw: any, i: number) => (
                                <div key={i} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                  <span className="text-xs font-bold text-slate-800 leading-tight flex-1">{flaw.name}</span>
                                  <div className="flex gap-1.5 shrink-0">
                                    <button 
                                      onClick={() => setAiChecks(prev => ({ ...prev, [flaw.name]: true }))}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${aiChecks[flaw.name] === true ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                      Yes
                                    </button>
                                    <button 
                                      onClick={() => setAiChecks(prev => ({ ...prev, [flaw.name]: false }))}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${aiChecks[flaw.name] === false ? 'bg-red-100 border-red-300 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-center">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No AI flaws marked in this image</span>
                          </div>
                        )}
                     </div>
                   )}

                   {/* Product Details */}
                   <div className="text-center">
                     <span className="inline-block mb-2 bg-slate-100 text-slate-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-slate-200">
                       {activePickup.products?.category || "Electronics"}
                     </span>
                     <h3 className="font-black text-slate-900 text-xl sm:text-2xl leading-tight tracking-tight">{activePickup.products?.title}</h3>
                   </div>
                </div>

                {/* AI Pre-grade block */}
                {!activePickup.flaws_json?.is_fast_track ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-[2rem] p-6 sm:p-8 border border-blue-100 space-y-5 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/40 rounded-bl-full -z-0"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <h4 className="font-black text-blue-900 text-base flex items-center gap-2">
                        <ScanLine className="w-5 h-5 text-blue-600" /> AI Inspection Summary
                      </h4>
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-md shadow-blue-600/20">
                        {activePickup.ai_grade || activePickup.grade || "B"}
                      </div>
                    </div>
                    
                    <p className="text-sm font-semibold text-blue-800 relative z-10 border-l-2 border-blue-300 pl-3">
                      "{activePickup.flaws_json?.buyer_description || "Customer reported minor flaws."}"
                    </p>
                    
                    {activePickup.flaws_json?.summary && (
                      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl text-sm font-bold text-blue-950 relative z-10 border border-blue-100 shadow-sm leading-relaxed">
                        {activePickup.flaws_json.summary}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-200 space-y-4 shadow-sm">
                     <h4 className="font-black text-emerald-900 text-base flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Fast-Track Return
                      </h4>
                      <p className="text-sm font-semibold text-emerald-800">
                        Customer has a high trust score. No AI photo was required. Just perform a basic physical check.
                      </p>
                  </div>
                )}



                {/* Checklist */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-slate-400" /> Physical Checks
                  </h4>
                  
                  <div className="bg-white rounded-[2rem] p-3 border border-slate-200 shadow-sm">
                    {[
                      `Item matches ${activePickup.products?.title}`,
                      "Original packaging is included",
                      "No severe unmentioned physical damage"
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => setPhysicalChecks(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-2xl cursor-pointer select-none"
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${physicalChecks[i] ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-50 border-slate-300'}`}>
                          {physicalChecks[i] && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`text-sm font-bold ${physicalChecks[i] ? 'text-emerald-900' : 'text-slate-700'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Decision */}
                <div className="space-y-4 pb-8">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Package className="w-5 h-5 text-slate-400" /> Final Assessment
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => setAgentDecision("match")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${agentDecision === 'match' ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${agentDecision === 'match' ? 'border-emerald-500' : 'border-slate-300'}`}>
                          {agentDecision === 'match' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${agentDecision === 'match' ? 'text-emerald-900' : 'text-slate-700'}`}>Condition Matches AI</p>
                          <p className="text-xs text-slate-500 mt-0.5">Proceed with standard pickup</p>
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setAgentDecision("mismatch")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${agentDecision === 'mismatch' ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${agentDecision === 'mismatch' ? 'border-amber-500' : 'border-slate-300'}`}>
                          {agentDecision === 'mismatch' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${agentDecision === 'mismatch' ? 'text-amber-900' : 'text-slate-700'}`}>Discrepancies Found</p>
                          <p className="text-xs text-slate-500 mt-0.5">Pick up, but flag for warehouse inspection</p>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setAgentDecision("wrong_item")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${agentDecision === 'wrong_item' ? 'bg-red-50 border-red-500 shadow-sm' : 'bg-white border-slate-200 hover:border-red-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${agentDecision === 'wrong_item' ? 'border-red-500' : 'border-slate-300'}`}>
                          {agentDecision === 'wrong_item' && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${agentDecision === 'wrong_item' ? 'text-red-900' : 'text-slate-700'}`}>Wrong Item / Severe Damage</p>
                          <p className="text-xs text-slate-500 mt-0.5">Reject pickup entirely</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Bottom Bar */}
              <div className="bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 md:p-6 fixed bottom-0 left-0 right-0 md:absolute z-30 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:rounded-br-[2.5rem]">
                <div className="max-w-2xl mx-auto flex">
                  <Button 
                    disabled={actionLoading || !agentDecision}
                    onClick={processPickup}
                    className={`flex-1 font-black py-7 rounded-2xl text-base transition-transform active:scale-[0.98] shadow-lg ${agentDecision === 'wrong_item' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20' : agentDecision === 'mismatch' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'} ${!agentDecision ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : ''}`}
                  >
                    {actionLoading ? (
                      "Processing..."
                    ) : agentDecision === 'wrong_item' ? (
                      <><XCircle className="w-5 h-5 mr-2" /> Complete & Reject</>
                    ) : agentDecision === 'mismatch' ? (
                      <><AlertTriangle className="w-5 h-5 mr-2" /> Pick Up & Flag</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5 mr-2" /> Complete Pickup</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-blue-600" /> Scan Package
              </h3>
              <button onClick={() => setScannerOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer">
                <XCircle className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl min-h-[200px] flex items-center justify-center mb-6 relative overflow-hidden p-2">
              <PickupScanner onScan={(text) => {
                const match = pickups.find(p => getAWB(p) === text);
                if (match) {
                  setScannerOpen(false);
                  setScannedAwb("");
                  handleSelectPickup(match);
                } else {
                  alert("AWB not found in today's route.");
                }
              }} />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-500 font-bold uppercase tracking-wider">Or enter manually</span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. AWB-UUID1234"
                value={scannedAwb}
                onChange={e => setScannedAwb(e.target.value.toUpperCase())}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const match = pickups.find(p => getAWB(p) === scannedAwb);
                    if (match) {
                      setScannerOpen(false);
                      setScannedAwb("");
                      handleSelectPickup(match);
                    } else {
                      alert("AWB not found in today's route.");
                    }
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 font-mono font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase"
              />
              <Button 
                onClick={() => {
                  const match = pickups.find(p => getAWB(p) === scannedAwb);
                  if (match) {
                    setScannerOpen(false);
                    setScannedAwb("");
                    handleSelectPickup(match);
                  } else {
                    alert("AWB not found in today's route.");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6"
              >
                Find
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-square bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white rounded-full p-2 z-50 transition-colors"
              onClick={() => setExpandedImage(null)}
            >
              <XCircle className="w-8 h-8" />
            </button>
            <AnnotatedImage
              imageUrl={expandedImage.url}
              flaws={expandedImage.imageFlaws || []}
              width={1000}
              height={1000}
            />
            <div className="absolute bottom-6 left-6 flex gap-3 z-50">
              <span className="bg-black/80 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg backdrop-blur-md">
                Angle {expandedImage.originalIndex + 1}
              </span>
              {expandedImage.imageFlaws && expandedImage.imageFlaws.length > 0 && (
                <span className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/50">
                  {expandedImage.imageFlaws.length} Defect{expandedImage.imageFlaws.length > 1 ? 's' : ''} Highlighted
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
