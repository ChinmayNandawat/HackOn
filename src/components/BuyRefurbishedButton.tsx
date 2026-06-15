"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  originalPrice: number;
  estimatedResalePrice: number;
}

export default function BuyRefurbishedButton({ productId, originalPrice, estimatedResalePrice }: Props) {
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const discountPercent = Math.round(((originalPrice - estimatedResalePrice) / originalPrice) * 100);

  const handleBuy = async () => {
    setLoading(true);
    try {
      // 1. Create order (assuming dummy buyer_id for MVP: '00000000-0000-0000-0000-000000000002')
      await supabase.from("orders").insert({
        buyer_id: "00000000-0000-0000-0000-000000000002",
        product_id: productId,
        status: "completed"
      });

      // 2. Mark product as sold
      await supabase.from("products").update({ relist_status: "sold" }).eq("id", productId);

      // 3. Fire and forget POST to impact API
      fetch("/api/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "ssr-session",
          actionType: "buy_refurbished",
          productId: productId
        })
      }).catch(console.error);

      setShowToast(true);

      // Hide toast and redirect to orders
      setTimeout(() => {
        setShowToast(false);
        router.push("/orders");
      }, 2000);
    } catch (err) {
      console.error("Failed to buy:", err);
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button 
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-7 text-lg font-black tracking-wide rounded-xl shadow-xl hover:scale-[1.01] transition-transform active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70"
      >
        {loading ? "Processing..." : `Buy Refurbished — Save ${discountPercent}%`}
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
