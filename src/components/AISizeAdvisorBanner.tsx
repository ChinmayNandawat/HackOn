"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight, Sparkles, Lightbulb } from "lucide-react";
import { CartItem } from "@/context/CartContext";
import { getReturnRiskData } from "@/lib/mock-prevention";

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

  // Dynamically calculate category-specific return risk & sizing advice
  const riskData = getReturnRiskData(
    cartItem.product.id,
    cartItem.product.return_risk_score,
    cartItem.product.category,
    cartItem.product.title,
    currentSize
  );

  const defaultAdvice = `We noticed you selected Size ${currentSize}, but customer review sentiment and fit models indicate this item runs slightly snug. AI recommends Size ${recommendedSize} for the optimal fit.`;
  const displayAdvice = riskData.reason ? `${riskData.reason}` : defaultAdvice;

  if (switched) {
    return (
      <div className="rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 p-4 sm:p-5 text-sm text-emerald-950 dark:text-emerald-100 shadow-sm transition-all animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-emerald-600 text-white dark:bg-emerald-500 shrink-0 mt-0.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-1.5">
            <p className="font-extrabold text-base leading-snug text-emerald-900 dark:text-emerald-200">
              ✓ Size adjusted! Return risk reduced by 65%.
            </p>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 font-medium">
              Switched <span className="underline decoration-emerald-500 font-bold">{cartItem.product.title}</span> from Size <span className="line-through opacity-70">{currentSize}</span> to <span className="font-black text-emerald-900 dark:text-emerald-100 bg-emerald-200/60 dark:bg-emerald-800/60 px-2 py-0.5 rounded">Size {recommendedSize}</span>!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 p-4 sm:p-5 text-sm text-slate-800 dark:text-slate-100 shadow-sm transition-all space-y-3.5">
      <div className="flex items-start gap-3 leading-relaxed">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5 border border-amber-200/80 dark:border-amber-800">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-300 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-amber-950 dark:text-amber-100 text-sm">
              Universal AI Size Advisor • Return Prevention
            </span>
            {riskData.riskPercent >= 20 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                ⚠️ {riskData.riskPercent}% Return Risk
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 font-medium leading-relaxed">
            {displayAdvice}
          </p>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-start">
        <button
          onClick={handleSwitch}
          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 w-full sm:w-auto justify-center"
        >
          <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-900 animate-pulse" />
          <span>Switch Size &amp; Reduce Return Risk</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

