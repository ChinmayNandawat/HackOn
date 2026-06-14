"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ListingStatusActions({ productId, initialStatus }: { productId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus || "active");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsSold = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("products").update({ relist_status: 'sold' }).eq('id', productId);
      if (error) throw error;
      setStatus('sold');
      router.refresh();
    } catch (err) {
      console.error("Failed to mark as sold:", err);
    } finally {
      setLoading(false);
    }
  };

  const badgeClass = 
    status === 'active' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none px-3" :
    status === 'sold' ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-none px-3" :
    "bg-amber-100 text-amber-800 hover:bg-amber-100 border-none px-3";

  return (
    <div className="flex flex-col items-end gap-3 text-right">
      <Badge className={badgeClass}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild className="font-bold text-slate-600">
          <Link href={`/product/${productId}`}>View Listing</Link>
        </Button>
        {status === 'active' && (
          <Button size="sm" onClick={handleMarkAsSold} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            {loading ? "..." : "Mark as Sold"}
          </Button>
        )}
      </div>
    </div>
  );
}
