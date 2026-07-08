"use client";

import React, { useState } from "react";
import { Product } from "@/types/database";
import AnnotatedImage from "./AnnotatedImage";
import { 
  ShieldCheck, 
  Shield, 
  Leaf, 
  Clock, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface ProductHealthCardProps {
  product: Product;
  showFullDetail?: boolean;
  overridePrice?: number;
}

export default function ProductHealthCard({ product, showFullDetail = true, overridePrice }: ProductHealthCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
  const return_photo_urls = health_data?.return_photo_urls || [];

  // Determine which image to show with annotations
  const displayImages = return_photo_urls.length > 0 ? return_photo_urls : [image_url || 'https://via.placeholder.com/600'];
  const currentImageUrl = displayImages[currentImageIndex] || displayImages[0];
  const flawsToDraw = flaws.filter((f: any) => f.image_index === currentImageIndex || (f.image_index === undefined && currentImageIndex === 0));

  // Derived prices
  const origPrice = Number(original_price) || 0;
  const resalePrice = overridePrice !== undefined ? overridePrice : (Number(estimated_resale_price) || 0);
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
    <div className="w-full font-sans">
      {showFullDetail ? (
        <div className="w-full space-y-6">
          {/* Section Header Strip */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-100/50 p-5 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">AI Verified Product</h2>
              <p className="text-xs text-gray-600 font-medium">Independently graded by Amazon ReLife AI</p>
            </div>
          </div>

          {/* Horizontal Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start w-full mt-6">
            {/* Left Side (5 cols): Visual AI Evidence & Grade Card */}
            <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm w-full space-y-6 lg:sticky lg:top-24">
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
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      confidence.toLowerCase() === "high"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : confidence.toLowerCase() === "medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {confidence}
                  </span>
                </div>
              </div>

              {/* Annotated Photo Gallery */}
              <div className="flex flex-col items-center border border-gray-100 bg-gray-50/50 rounded-xl p-3 relative">
                <div
                  className="relative group flex items-center justify-center w-full max-w-[380px] overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                >
                  <AnnotatedImage imageUrl={currentImageUrl} flaws={flawsToDraw} width={380} height={380} />

                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
                        }}
                        className="absolute left-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                        {displayImages.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(idx);
                            }}
                            className={`w-2 h-2 rounded-full transition-colors shadow-sm cursor-pointer ${
                              idx === currentImageIndex ? "bg-gray-800" : "bg-gray-400 hover:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-3 italic text-center">
                  Click image to expand · AI-detected issues are highlighted.
                </p>
              </div>
            </div>

            {/* Right Side (7 cols): Detected Issues, Circular Impact & History Timeline */}
            <div className="lg:col-span-7 space-y-8">
              {/* Detected Flaws */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  Detected Issues ({flaws.length})
                </h3>
                {flaws.length === 0 ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm font-semibold">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    No significant flaws detected.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {flaws.map(
                      (flaw: { name?: string; type?: string; severity?: string; description?: string }, index: number) => {
                        const sev = flaw.severity?.toLowerCase() || "minor";
                        const sevClass =
                          sev === "major"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : sev === "moderate"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-700 border-gray-200";

                        return (
                          <div
                            key={index}
                            className="flex flex-col border border-gray-200/80 rounded-xl p-4 bg-white gap-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-bold text-gray-800">
                                {flaw.name || flaw.type || "Issue"}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${sevClass}`}
                              >
                                {sev}
                              </span>
                            </div>
                            {flaw.description && (
                              <span className="text-xs text-gray-500 leading-relaxed">{flaw.description}</span>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Price / Savings Row */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Original</span>
                  <span className="text-sm font-medium text-gray-500 line-through">
                    ₹{origPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Your Price</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ₹{resalePrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                    <span className="text-[10px] font-extrabold text-white bg-emerald-500 px-2.5 py-1 rounded-full uppercase tracking-wider mb-1 shadow-sm shadow-emerald-500/20">
                      You Save
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      ₹{savings.toLocaleString("en-IN")} ({savingsPercent}% off)
                    </span>
                  </div>
                )}
              </div>

              {/* 3 Guarantee Badges Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200/70">
                  <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    <span className="font-bold text-gray-800 block mb-0.5">30-Day Guarantee</span>
                    Full refund if product does not match this Health Card.
                  </p>
                </div>
                <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200/70">
                  <Leaf className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    <span className="font-bold text-gray-800 block mb-0.5">CO₂ Saved</span>
                    Buying refurbished saves approximately 2.4 kg of CO₂ vs buying new.
                  </p>
                </div>
                <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200/70">
                  <Clock className="w-5 h-5 text-purple-500 shrink-0" />
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    <span className="font-bold text-gray-800 block mb-0.5">AI Inspected</span>
                    Graded in under 60 seconds by Amazon ReLife AI.
                  </p>
                </div>
              </div>

              {/* Product History Timeline */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Product History</h3>
                <div className="relative pl-4 space-y-4 before:absolute before:inset-y-2 before:left-[5px] before:w-px before:bg-gray-200">
                  <div className="relative flex items-center gap-3">
                    <div className="absolute left-[-19px] w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
                    <span className="text-xs text-gray-500 min-w-[140px] font-medium">{formatDate(created_at)}</span>
                    <span className="text-sm font-semibold text-gray-800">Originally purchased</span>
                  </div>
                  <div className="relative flex items-center gap-3">
                    <div className="absolute left-[-19px] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm shadow-emerald-500/50" />
                    <span className="text-xs text-emerald-600 min-w-[140px] font-bold">
                      {formatDate(relisted_at || new Date().toISOString())}
                    </span>
                    <span className="text-sm font-bold text-gray-900">Returned and inspected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Compact Card for Marketplace/Quick-view */
        <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <span className={`text-5xl font-black ${gradeColorClass} leading-none`}>{grade}</span>
            <div className="flex-1 max-w-[200px] flex flex-col justify-center">
              <span className="text-lg font-extrabold text-gray-800 mb-1">{score}/100</span>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${gradeBgClass} rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightboxOpen(false);
            if (e.key === "ArrowLeft")
              setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
            if (e.key === "ArrowRight")
              setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
          }}
          tabIndex={0}
          role="dialog"
          ref={(el) => el?.focus()}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-xl text-gray-800 hover:bg-gray-100 transition-colors z-30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
              <AnnotatedImage imageUrl={currentImageUrl} flaws={flawsToDraw} width={700} height={700} />

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-800 transition-colors z-20 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-800 transition-colors z-20 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              {displayImages.length > 1 && (
                <div className="flex justify-center gap-2">
                  {displayImages.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-colors shadow-sm border-2 cursor-pointer ${
                        idx === currentImageIndex
                          ? "bg-white border-white"
                          : "bg-white/40 border-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
              <p className="text-white/80 text-sm font-medium">
                Image {currentImageIndex + 1} of {displayImages.length}
                {flawsToDraw.length > 0 &&
                  ` · ${flawsToDraw.length} issue${flawsToDraw.length > 1 ? "s" : ""} detected`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
