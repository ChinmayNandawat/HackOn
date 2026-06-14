"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getOrCreateSessionId } from "@/lib/session";
import { CheckCircle2 } from "lucide-react";

interface Props {
  productId: string;
  originalPrice: number;
  estimatedResalePrice: number;
}

export default function BuyRefurbishedButton({ productId, originalPrice, estimatedResalePrice }: Props) {
  const [showToast, setShowToast] = useState(false);

  const discountPercent = Math.round(((originalPrice - estimatedResalePrice) / originalPrice) * 100);

  const handleBuy = () => {
    // Fire and forget POST to impact API
    fetch("/api/impact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getOrCreateSessionId(),
        actionType: "buy_refurbished",
        productId: productId
      })
    }).catch(console.error);

    setShowToast(true);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="relative">
      <Button 
        onClick={handleBuy}
        className="w-full py-7 text-lg font-black tracking-wide rounded-xl shadow-xl hover:scale-[1.01] transition-transform active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        Buy Refurbished — Save {discountPercent}%
      </Button>

      {/* Toast Notification */}
      {showToast && (
        <div className="absolute -top-14 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            You earned 30 Green Credits! 🌱
          </div>
        </div>
      )}
    </div>
  );
}
