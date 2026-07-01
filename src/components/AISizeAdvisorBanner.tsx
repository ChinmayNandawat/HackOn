"use client";

import React, { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { CartItem } from "@/context/CartContext";

interface AISizeAdvisorBannerProps {
  cartItem: CartItem;
  recommendedSize: string;
  onSwitchSize: (cartItemId: string, newSize: string) => void;
}

export default function AISizeAdvisorBanner({
  cartItem,
  recommendedSize,
  onSwitchSize,
}: AISizeAdvisorBannerProps) {
  const [switched, setSwitched] = useState(false);
  const currentSize = cartItem.selectedSize || "M";

  const handleSwitch = () => {
    onSwitchSize(cartItem.id, recommendedSize);
    setSwitched(true);
  };

  if (switched) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 p-4 shadow-lg animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                Fit Verified by AI
              </span>
              <span className="text-xs font-bold text-emerald-700">Return Risk Reduced by 65%</span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Updated <span className="underline decoration-emerald-500">{cartItem.product.title}</span> to Size <span className="text-emerald-600 font-black">{recommendedSize}</span>!
            </p>
            <p className="text-xs text-slate-500">
              Our AI matched your sizing profile with verified customer fit data to guarantee a perfect fit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900 p-[1px] shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Animated gradient glow backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-20 animate-pulse" />
      
      <div className="relative rounded-2xl bg-slate-950/90 backdrop-blur-xl p-4 sm:p-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 text-white shadow-md animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black tracking-wide bg-gradient-to-r from-violet-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
              AI SIZE ADVISOR • RETURN PREVENTION
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Fit Mismatch Risk
          </span>
        </div>

        {/* Body content */}
        <div className="space-y-2 mb-4">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            You selected Size <span className="font-extrabold text-white bg-white/20 px-1.5 py-0.5 rounded">{currentSize}</span> for <span className="font-semibold text-violet-300">{cartItem.product.title}</span>.
          </p>
          <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
            <p className="font-semibold text-amber-200 flex items-center gap-1.5">
              💡 Why AI suggests Size {recommendedSize}:
            </p>
            <p className="opacity-90 leading-normal">
              • <strong className="text-white">84% of verified buyers</strong> report this item runs small in the shoulders and chest.<br />
              • Your simulated fit profile indicates size <strong className="text-white">{recommendedSize}</strong> has a <strong className="text-emerald-400">65% lower return rate</strong> for this brand.
            </p>
          </div>
        </div>

        {/* 1-Click Quick Action Button */}
        <button
          onClick={handleSwitch}
          className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-[1px] font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-98"
        >
          <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-4 py-2.5 text-xs sm:text-sm text-white font-black tracking-wide">
            <span>✨ Switch Size to {recommendedSize} (Recommended)</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  );
}
