"use client";

import React from "react";
import { Product } from "@/types/database";
import AnnotatedImage from "./AnnotatedImage";
import { 
  ShieldCheck, 
  Shield, 
  Leaf, 
  Clock, 
  CheckCircle
} from "lucide-react";

interface ProductHealthCardProps {
  product: Product;
  showFullDetail?: boolean;
}

export default function ProductHealthCard({ product, showFullDetail = true }: ProductHealthCardProps) {
  const {
    health_data,
    estimated_resale_price,
    original_price,
    created_at,
    relisted_at,
    image_url
  } = product;

  // Extracted data
  const grade = health_data?.grade || "Unknown";
  const score = health_data?.score || 0;
  const confidence = health_data?.confidence || "Unknown";
  const flaws = health_data?.flaws || [];

  // Derived prices
  const origPrice = Number(original_price) || 0;
  const resalePrice = Number(estimated_resale_price) || 0;
  const savings = origPrice - resalePrice;
  const savingsPercent = origPrice > 0 ? Math.round((savings / origPrice) * 100) : 0;

  // Format dates
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Grade color map
  const getGradeColor = (g: string) => {
    switch (g?.toUpperCase()) {
      case "A": return "text-[#16A34A]";
      case "B": return "text-[#0D9488]";
      case "C": return "text-[#D97706]";
      case "D": return "text-[#DC2626]";
      default: return "text-gray-500";
    }
  };

  const getGradeBg = (g: string) => {
    switch (g?.toUpperCase()) {
      case "A": return "bg-[#16A34A]";
      case "B": return "bg-[#0D9488]";
      case "C": return "bg-[#D97706]";
      case "D": return "bg-[#DC2626]";
      default: return "bg-gray-500";
    }
  };

  const gradeColorClass = getGradeColor(grade);
  const gradeBgClass = getGradeBg(grade);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm font-sans flex flex-col">
      {/* SECTION 1: AI Verified Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-100/50 p-4 border-b border-emerald-100 flex items-start gap-3">
        <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">AI Verified Product</h2>
          <p className="text-xs text-gray-600 font-medium">Independently graded by Amazon ReLife AI</p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* SECTION 2: Grade Display */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-6">
            <span className={`text-6xl font-black ${gradeColorClass} leading-none`}>
              {grade}
            </span>
            <div className="flex-1 max-w-[200px] flex flex-col justify-center">
              <span className="text-xl font-extrabold text-gray-800 mb-1">{score}/100</span>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${gradeBgClass} rounded-full`} 
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
              confidence.toLowerCase() === 'high' ? 'bg-green-50 text-green-700 border-green-200' :
              confidence.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {confidence}
            </span>
          </div>
        </div>

        {/* SECTION 3: Annotated Photo */}
        {showFullDetail && (
          <div className="flex flex-col items-center border border-gray-100 bg-gray-50/50 rounded-xl p-3">
            <AnnotatedImage 
              imageUrl={image_url} 
              flaws={flaws} 
              width={380} 
              height={380} 
            />
            <p className="text-[11px] text-gray-500 mt-3 italic text-center">
              AI-detected issues are highlighted on this photo.
            </p>
          </div>
        )}

        {/* SECTION 4: Flaw List */}
        {showFullDetail && (
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
              Detected Issues ({flaws.length})
            </h3>
            {flaws.length === 0 ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 p-3 rounded-lg text-sm font-semibold">
                <CheckCircle className="w-5 h-5 text-green-500" />
                No significant flaws detected.
              </div>
            ) : (
              <div className="space-y-2">
                {flaws.map((flaw: { name?: string, type?: string, severity?: string, description?: string }, index: number) => {
                  const sev = flaw.severity?.toLowerCase() || 'minor';
                  const sevClass = 
                    sev === 'major' ? 'bg-red-50 text-red-700 border-red-200' :
                    sev === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-50 text-gray-700 border-gray-200';
                  
                  return (
                    <div key={index} className="flex flex-col border border-gray-100 rounded-lg p-3 bg-white gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-800">{flaw.name || flaw.type || 'Issue'}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${sevClass}`}>
                          {sev}
                        </span>
                      </div>
                      {flaw.description && (
                        <span className="text-xs text-gray-500">{flaw.description}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: Price Comparison */}
        <div className="bg-white border-y border-dashed border-gray-200 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Original</span>
            <span className="text-sm font-medium text-gray-500 line-through">₹{origPrice.toLocaleString("en-IN")}</span>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Your Price</span>
            <span className="text-2xl font-black text-emerald-600">₹{resalePrice.toLocaleString("en-IN")}</span>
          </div>
          
          {savings > 0 && (
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
              <span className="text-[10px] font-extrabold text-white bg-emerald-500 px-2.5 py-1 rounded-full uppercase tracking-wider mb-1 shadow-sm shadow-emerald-500/20">
                You Save
              </span>
              <span className="text-sm font-bold text-emerald-700">₹{savings.toLocaleString("en-IN")} ({savingsPercent}% off)</span>
            </div>
          )}
        </div>

        {/* SECTION 6: Trust Badges */}
        {showFullDetail && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 font-medium leading-tight">
                <span className="font-bold text-gray-800 block mb-0.5">30-Day Guarantee</span>
                Full refund if product does not match this Health Card.
              </p>
            </div>
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Leaf className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 font-medium leading-tight">
                <span className="font-bold text-gray-800 block mb-0.5">CO₂ Saved</span>
                Buying refurbished saves approximately 2.4 kg of CO₂ vs buying new.
              </p>
            </div>
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Clock className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 font-medium leading-tight">
                <span className="font-bold text-gray-800 block mb-0.5">AI Inspected</span>
                Graded in under 60 seconds by Amazon ReLife AI.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 7: Product History */}
        {showFullDetail && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Product History</h3>
            <div className="relative pl-3 space-y-4 before:absolute before:inset-y-2 before:left-[3px] before:w-px before:bg-gray-200">
              <div className="relative flex items-center gap-3">
                <div className="absolute left-[-15px] w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
                <span className="text-xs text-gray-500 min-w-[120px] font-medium">{formatDate(created_at)}</span>
                <span className="text-sm font-semibold text-gray-800">Originally purchased</span>
              </div>
              <div className="relative flex items-center gap-3">
                <div className="absolute left-[-15px] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm shadow-emerald-500/50" />
                <span className="text-xs text-emerald-600 min-w-[120px] font-bold">{formatDate(relisted_at || new Date().toISOString())}</span>
                <span className="text-sm font-bold text-gray-900">Returned and inspected</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
