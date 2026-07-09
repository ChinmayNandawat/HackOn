"use client";

import React, { useState } from "react";
import { PhysicalHandlingQueueItem } from "./PhysicalHandlingQueueSection";
import AnnotatedImage from "@/components/AnnotatedImage";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from "lucide-react";

interface WarehouseInspectionCardProps {
  item: PhysicalHandlingQueueItem;
}

export default function WarehouseInspectionCard({ item }: WarehouseInspectionCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const grade = item.ai_grade || "Unknown";
  const score = item.ai_score || 0;
  const flaws = item.flaws_json?.flaws || [];
  
  // Use return_photo_urls from flaws_json if it exists (which comes from the agent) or fallback to item.image_urls
  const photoUrls = item.flaws_json?.return_photo_urls || item.image_urls || [];
  const displayImages = photoUrls.length > 0 ? photoUrls : (item.product?.image_url ? [item.product.image_url] : ["https://via.placeholder.com/600"]);
  
  const currentImageUrl = displayImages[currentImageIndex] || displayImages[0];
  const flawsToDraw = flaws.filter((f: any) => f.image_index === currentImageIndex || (f.image_index === undefined && currentImageIndex === 0));

  const getGradeColorStyle = (g: string) => {
    switch (g?.toUpperCase()) {
      case "A+": return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", fill: "bg-emerald-500", shadow: "shadow-emerald-500/20" };
      case "A": return { text: "text-green-700", bg: "bg-green-50", border: "border-green-200", fill: "bg-green-500", shadow: "shadow-green-500/20" };
      case "B": return { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", fill: "bg-blue-500", shadow: "shadow-blue-500/20" };
      case "C": return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", fill: "bg-amber-500", shadow: "shadow-amber-500/20" };
      case "D": return { text: "text-red-700", bg: "bg-red-50", border: "border-red-200", fill: "bg-red-500", shadow: "shadow-red-500/20" };
      default: return { text: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", fill: "bg-gray-500", shadow: "shadow-gray-500/20" };
    }
  };

  const style = getGradeColorStyle(grade);

  return (
    <div className="w-full space-y-4">
      
      {/* 1. Header & AI Grade Summary */}
      <div className={`relative overflow-hidden flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-6 border border-gray-200 shadow-sm`}>
        <div className="flex items-center gap-5 z-10">
          {/* Prominent Grade Badge */}
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl ${style.bg} border-2 ${style.border} shadow-lg ${style.shadow}`}>
            <span className={`text-4xl font-black ${style.text} leading-none tracking-tighter`}>
              {grade}
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${style.text} opacity-80`} />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Assessed Condition</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{score}</span>
              <span className="text-sm font-bold text-gray-400">/ 100 Score</span>
            </div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full sm:w-48 mt-4 sm:mt-0 z-10">
           <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
             <span className="text-gray-400">Confidence Level</span>
             <span className={style.text}>High</span>
           </div>
           <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full ${style.fill} transition-all duration-1000 ease-out`}
               style={{ width: `${score}%` }}
             />
           </div>
        </div>

        {/* Decorative background element */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full ${style.bg} opacity-50 blur-3xl`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2. Visual Evidence Gallery */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="w-full flex items-center justify-between mb-4">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visual Evidence</span>
             <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
               {currentImageIndex + 1} / {displayImages.length}
             </span>
          </div>
          
          <div 
            className="relative group flex items-center justify-center w-full aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-50 cursor-pointer shadow-sm"
            onClick={() => setLightboxOpen(true)}
          >
            <AnnotatedImage imageUrl={currentImageUrl} flaws={flawsToDraw} width={600} height={600} />
            
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1)); }}
                  className="absolute left-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1)); }}
                  className="absolute right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {displayImages.length > 1 && (
             <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
               {displayImages.map((img: string, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${currentImageIndex === i ? "border-blue-500 shadow-sm opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i+1}`} />
                  </div>
               ))}
             </div>
          )}
        </div>

        {/* 3. Flaws List */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">Detected Flaws ({flaws.length})</span>
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-1 space-y-3">
            {flaws.length === 0 ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-lg text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                No physical damages detected by AI.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flaws.map((flaw: any, index: number) => {
                  const sev = flaw.severity?.toLowerCase() || "minor";
                  const sevClass = sev === "major" ? "bg-red-50 text-red-700 border-red-200" : sev === "moderate" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-700 border-gray-200";
                  
                  // Agent verified flaw if pickup is completed and no discrepancies flagged
                  const agentVerified = !item.flaws_json?.pickup_flagged;

                  return (
                    <div key={index} className="flex flex-col border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:border-gray-300 transition-colors gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-800">{flaw.name || "Issue"}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${sevClass}`}>{sev}</span>
                      </div>
                      {flaw.description && <span className="text-xs text-gray-500 leading-relaxed">{flaw.description}</span>}
                      
                      {agentVerified && (
                        <div className="flex items-center gap-1.5 mt-1 pt-2 border-t border-gray-100">
                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                           <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Verified by Pickup Agent</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Pickup Agent Report */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>Pickup Agent Verification Report</span>
        </h4>
        {item.flaws_json?.pickup_flagged ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-sm uppercase tracking-wide">Discrepancies Flagged at Pickup</p>
              <p className="text-sm mt-1 font-medium">{item.flaws_json?.pickup_agent_notes || "Agent noted that the physical condition differs from the AI assessment."}</p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-sm uppercase tracking-wide">Agent Verified - Condition Matches</p>
              <p className="text-xs mt-0.5 text-emerald-700 font-medium">Pickup agent confirmed no unexpected damage.</p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxOpen(false)} className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors z-30 cursor-pointer flex items-center gap-2">
              <X className="w-6 h-6" /> Close
            </button>
            <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl">
              <AnnotatedImage imageUrl={currentImageUrl} flaws={flawsToDraw} width={700} height={700} />
              {displayImages.length > 1 && (
                <>
                  <button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg text-slate-800 transition-colors z-20 cursor-pointer">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={() => setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg text-slate-800 transition-colors z-20 cursor-pointer">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
