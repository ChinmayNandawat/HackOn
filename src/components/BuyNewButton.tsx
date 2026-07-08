"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BuyNewButton({ productId }: { productId: string }) {
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuy = async () => {
    setLoading(true);
    try {
      // 1. Create order (assuming dummy buyer_id for MVP)
      await supabase.from("orders").insert({
        buyer_id: "00000000-0000-0000-0000-000000000002",
        product_id: productId,
        status: "completed"
      });

      // 2. Mark product as sold
      await supabase.from("products").update({ relist_status: "sold" }).eq("id", productId);

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
        className="w-full py-4 text-sm font-semibold tracking-wide rounded-xl shadow-md hover:scale-[1.01] transition-transform active:scale-95 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-70 cursor-pointer"
      >
        {loading ? "Processing..." : "Buy Now"}
      </Button>

      {/* Toast Notification */}
      {showToast && (
        <div className="absolute -top-14 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Order placed successfully!
          </div>
        </div>
      )}
    </div>
  );
}
