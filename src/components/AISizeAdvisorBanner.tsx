"use client";

import React, { useState } from "react";
import { Info, CheckCircle2, ArrowRight } from "lucide-react";
import { CartItem } from "@/context/CartContext";

interface AISizeAdvisorBannerProps {
  cartItem: CartItem;
  recommendedSize: string;
  reasonText?: string;
  onSwitchSize: (cartItemId: string, newSize: string) => void;
}

export default function AISizeAdvisorBanner({
  cartItem,
  recommendedSize,
  reasonText = "Sizing up is recommended based on past returns.",
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
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-800">
              Size updated to {recommendedSize}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Great choice! This significantly reduces the risk of fit issues.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 shadow-sm transition-all duration-300">
      <div className="flex items-start gap-2.5">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Sizing Tip
            </span>
          </div>
          
          <p className="text-sm text-blue-900 mb-2 leading-snug">
            You selected <strong>{currentSize}</strong>. {reasonText}
          </p>
          
          <button
            onClick={handleSwitch}
            className="group flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs text-white font-bold transition-colors"
          >
            Switch to Size {recommendedSize}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
