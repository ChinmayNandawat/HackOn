"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
      <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3.5 sm:p-4 text-sm text-emerald-900 dark:text-emerald-200 shadow-2xs transition-all animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold leading-snug">
              Switched <span className="underline decoration-emerald-500">{cartItem.product.title}</span> to Size <span className="font-black text-emerald-700 dark:text-emerald-300">{recommendedSize}</span>!
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
              Your sizing profile and customer fit data match Size {recommendedSize}, reducing potential return friction by 65%.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-3.5 sm:p-4 text-sm text-slate-700 dark:text-slate-200 shadow-2xs transition-all">
      <div className="space-y-2.5">
        <div className="flex items-start gap-2 leading-relaxed">
          <span className="text-base shrink-0 mt-0.5">👋</span>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Sizing tip: </span>
            <span>
              We noticed you ordered a Size <strong className="font-extrabold text-slate-900 dark:text-white">{currentSize}</strong> previously, but this brand tends to run slightly snug. We recommend choosing Size <strong className="font-black text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">{recommendedSize}</strong> for the best fit!
            </span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-start">
          <button
            onClick={handleSwitch}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <span>Switch to Size {recommendedSize}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
