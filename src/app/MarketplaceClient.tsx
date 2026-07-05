"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, RefreshCw, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  title: string;
  category?: string;
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
  relist_status?: string;
  stock?: number;
  return_count?: number;
  batch_number?: number | string;
}

function cleanProductTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(/\s*-\s*Refurbished.*$/i, "")
    .replace(/\s*\(Grade\s+[A-C]\)/i, "")
    .replace(/\s*-\s*Grade\s+[A-C]/i, "")
    .replace(/\s*-\s*Works\s+perfectly.*$/i, "")
    .replace(/\s*\[Refurbished\]/i, "")
    .replace(/^Refurbished\s*-\s*/i, "")
    .replace(/\bRefurbished\b/i, "")
    .trim();
}

function getBatchNumber(product: Product): number | string {
  if (product.batch_number) return product.batch_number;
  let sum = 0;
  for (let i = 0; i < product.id.length; i++) {
    sum += product.id.charCodeAt(i);
  }
  return (sum % 12) + 1;
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

  const { addToCart } = useCart();

  useEffect(() => {
    setNow(Date.now());
    const handleLocationChange = () => {
      setBuyerLocation(localStorage.getItem("relife_buyer_location") || "Mumbai");
    };
    handleLocationChange();
    window.addEventListener("relife_location_changed", handleLocationChange);
    return () => window.removeEventListener("relife_location_changed", handleLocationChange);
  }, []);

  const isFashionProduct = (product: Product) => {
    const cat = product.category || "";
    const title = product.title || "";
    const fashionCategories = ["Shoes", "Footwear", "Fashion", "Clothing", "Apparel", "Wearables"];
    const keywords = ["shirt", "jacket", "jeans", "dress", "sneakers", "shoe", "hoodie", "coat", "apparel", "wear"];
    return (
      fashionCategories.includes(cat) ||
      keywords.some((kw) => title.toLowerCase().includes(kw))
    );
  };

  const handleAddToCartClick = (
    e: React.MouseEvent,
    product: Product,
    displayPrice: number,
    isLocalDeal: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isRefurb = product.condition === 'refurbished' || product.is_refurbished;
    
    if (isFashionProduct(product) && !isRefurb) {
      window.location.href = `/product/${product.id}`;
      return;
    }
    
    const finalSize = (isFashionProduct(product) && isRefurb) ? "M" : undefined;
    addToCart(product, finalSize, displayPrice, isLocalDeal);
  };

  const filteredProducts = products.filter((product) => {
    // 1. Filter out sold out inventory or out of stock
    if (product.relist_status === "sold" || product.relist_status === "archived") return false;
    if (typeof product.stock === "number" && product.stock <= 0) return false;

    // 2. Return cycle protection: if returned 2+ times as refurbished, hide from standard grid
    if (typeof product.return_count === "number" && product.return_count >= 2) return false;

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Marketplace</h1>
        <p className="text-sm text-slate-500 mt-1">Browse new and refurbished products</p>
      </div>
      
      <div className="flex gap-2">
        <button onClick={() => setFilter("all")}>
          <Badge variant={filter === "all" ? "default" : "outline"} className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${filter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            All
          </Badge>
        </button>
        <button onClick={() => setFilter("new")}>
          <Badge variant={filter === "new" ? "default" : "outline"} className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${filter === "new" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            New
          </Badge>
        </button>
        <button onClick={() => setFilter("refurbished")}>
          <Badge 
            variant={filter === "refurbished" ? "default" : "outline"} 
            className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${filter === "refurbished" ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" : "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"}`}
          >
            Refurbished
          </Badge>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => {
          const isRefurb = product.condition === 'refurbished' || product.is_refurbished;
          const isFashion = isFashionProduct(product);
          
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
              <Card className={`hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col border-slate-200/80 ${isRefurb ? 'bg-white' : 'bg-white'} ${isLocalDeal ? 'ring-1 ring-amber-300' : ''}`}>
                <div className="h-44 sm:h-52 bg-slate-50 relative flex items-center justify-center overflow-hidden shrink-0 rounded-t-xl">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="object-contain w-full h-full p-4 mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <span className="text-slate-400 font-medium text-xs sm:text-sm">No Image</span>
                  )}
                  {isRefurb && (
                    <>
                      <div 
                        className="absolute top-0 right-0 z-10 bg-emerald-600 text-white font-bold text-[11px] sm:text-xs px-3 py-1 shadow-md rounded-tr-xl flex items-center select-none" 
                        style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%)', paddingLeft: '18px' }}
                      >
                        Refurbished
                      </div>
                      {(product.grade || product.health_data?.grade) && (
                        <span className="absolute top-2 left-2 bg-slate-900/90 text-white z-10 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded shadow-sm">Grade {product.grade || product.health_data?.grade}</span>
                      )}
                      {isLocalDeal && (
                        <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none text-white font-bold px-2 py-0.5 flex items-center shadow-lg z-10 text-[10px] sm:text-xs">
                          Local Deal <CountdownTimer targetDate={product.local_only_until!} />
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <CardContent className="p-4 relative flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 leading-snug text-slate-900 dark:text-white min-h-[40px]">{cleanProductTitle(product.title) || product.title}</h3>
                    {isRefurb && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 tracking-wide shadow-2xs">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" /> AI Verified
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className={isRefurb ? (isLocalDeal ? 'text-amber-600 font-bold text-lg' : 'text-slate-900 font-bold text-lg') : 'text-slate-900 font-semibold text-base sm:text-lg'}>
                        ₹{displayPrice.toLocaleString("en-IN")}
                      </p>
                      {isRefurb && product.original_price && (
                        <p className="text-slate-400 line-through text-xs">₹{product.original_price.toLocaleString("en-IN")}</p>
                      )}
                    </div>
                  </div>



                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={(e) => handleAddToCartClick(e, product, displayPrice, isLocalDeal)}
                      className={`w-full py-2 px-3 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                        isRefurb
                          ? "bg-slate-900 hover:bg-slate-800 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isFashion && !isRefurb ? "Select Options" : "Add to Cart"}</span>
                    </button>
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
