"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  original_price?: number;
  estimated_resale_price?: number;
  current_price?: number; // fallback
  condition: string;
  is_refurbished?: boolean;
  grade?: string;
  image_url?: string;
  location?: string | null;
  local_only_until?: string | null;
  local_deal_price?: number | null;
  standard_price?: number | null;
  health_data?: {
    grade?: string | null;
  };
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        const h = Math.floor((difference / (1000 * 60 * 60)));
        const m = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft(`${h}h ${m}m`);
      } else {
        setTimeLeft("");
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // update every minute
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;
  return <span className="ml-1 text-[10px] opacity-90">— {timeLeft} left</span>;
}

export default function MarketplaceClient({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | "new" | "refurbished">("all");
  const [buyerLocation, setBuyerLocation] = useState<string>("");
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    const handleLocationChange = () => {
      setBuyerLocation(localStorage.getItem("relife_buyer_location") || "Mumbai");
    };
    handleLocationChange();
    window.addEventListener("relife_location_changed", handleLocationChange);
    return () => window.removeEventListener("relife_location_changed", handleLocationChange);
  }, []);

  const filteredProducts = products.filter((product) => {
    // Handle Local Deal visibility rules
    if (product.local_only_until && now > 0) {
      const isDealActive = new Date(product.local_only_until).getTime() > now;
      if (isDealActive && product.location !== buyerLocation) {
        // Active deal in another location: DO NOT show to this buyer
        return false;
      }
    }

    if (filter === "all") return true;
    const isRefurbished = product.condition === "refurbished" || product.is_refurbished;
    if (filter === "refurbished") return isRefurbished;
    if (filter === "new") return !isRefurbished;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketplace</h1>
      </div>
      
      <div className="flex gap-2">
        <button onClick={() => setFilter("all")}>
          <Badge variant={filter === "all" ? "default" : "outline"} className={filter === "all" ? "bg-slate-900" : ""}>
            All
          </Badge>
        </button>
        <button onClick={() => setFilter("new")}>
          <Badge variant={filter === "new" ? "default" : "outline"} className={filter === "new" ? "bg-slate-900" : ""}>
            New Only
          </Badge>
        </button>
        <button onClick={() => setFilter("refurbished")}>
          <Badge 
            variant={filter === "refurbished" ? "default" : "outline"} 
            className={filter === "refurbished" ? "bg-green-600 hover:bg-green-700 text-white border-transparent" : "text-green-700 border-green-200 bg-green-50"}
          >
            Refurbished
          </Badge>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const isRefurb = product.condition === 'refurbished' || product.is_refurbished;
          
          let displayPrice = (isRefurb ? product.estimated_resale_price : product.original_price) || product.current_price || 0;
          let isLocalDeal = false;

          if (isRefurb && product.local_only_until && now > 0) {
             const dealActive = new Date(product.local_only_until).getTime() > now;
             if (dealActive && product.location === buyerLocation) {
               isLocalDeal = true;
               displayPrice = product.local_deal_price || displayPrice;
             } else if (!dealActive && product.standard_price) {
               displayPrice = product.standard_price;
             }
          }

          return (
            <Link href={`/product/${product.id}`} key={product.id}>
              <Card className={`hover:shadow-md transition cursor-pointer ${isRefurb ? 'border-green-200' : ''} ${isLocalDeal ? 'ring-2 ring-amber-400' : ''}`}>
                <div className="h-48 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-slate-400 font-medium">No Image</span>
                  )}
                  {isRefurb && (
                    <>
                      <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 z-10">AI Verified ✓</Badge>
                      {(product.grade || product.health_data?.grade) && (
                        <Badge className="absolute top-2 left-2 bg-slate-900 hover:bg-slate-800 z-10">Grade {product.grade || product.health_data?.grade}</Badge>
                      )}
                      {isLocalDeal && (
                        <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none text-white font-bold px-2.5 py-1 flex items-center shadow-lg z-10">
                          Local Deal <CountdownTimer targetDate={product.local_only_until!} />
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <CardContent className="p-4 relative">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={isRefurb ? (isLocalDeal ? 'text-amber-600 font-black text-xl' : 'text-green-700 font-bold text-lg') : 'text-slate-900 font-semibold'}>
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </p>
                    {isRefurb && product.original_price && (
                      <p className="text-slate-400 line-through text-sm">₹{product.original_price.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No products found matching the selected filter in your location.
          </div>
        )}
      </div>
    </div>
  );
}
